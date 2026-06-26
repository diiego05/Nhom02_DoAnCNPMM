import db from "../models/index.js";
import notificationService from "./notificationService.js";

const returnService = {
  createReturnRequest: async (userId, shopOrderId, data) => {
    const { reason, evidenceUrls, returnItems } = data; // returnItems: [{ orderItemId, quantity, reason/note }]
    
    const transaction = await db.sequelize.transaction();
    
    try {
      const order = await db.ShopOrder.findOne({
        where: { id: shopOrderId, status: "DELIVERED" },
        include: [
          { model: db.ParentOrder, as: "parentOrder", where: { user_id: userId } },
          { model: db.OrderItem, as: "items" }
        ],
        transaction
      });

      if (!order) {
        throw new Error("Không tìm thấy đơn hàng hợp lệ để trả hàng");
      }

      // Kiểm tra 7 ngày
      const deliveredLog = await db.ShopOrderStatusHistory.findOne({
        where: { shop_order_id: shopOrderId, new_status: "DELIVERED" },
        order: [["changed_at", "DESC"]],
        transaction
      });
      
      const deliveredTime = deliveredLog ? new Date(deliveredLog.changed_at) : new Date(order.updated_at);
      if (new Date() - deliveredTime > 7 * 24 * 60 * 60 * 1000) {
        throw new Error("Đã quá 7 ngày kể từ khi nhận hàng, không thể yêu cầu trả hàng");
      }

      const existingRequest = await db.ReturnRequest.findOne({
        where: { shop_order_id: shopOrderId, status: ["PENDING", "APPROVED_BY_SHOP", "RESOLVED_BY_ADMIN", "REJECTED"] },
        transaction
      });

      if (existingRequest) {
        throw new Error("Đơn hàng này đã có yêu cầu trả hàng đang được xử lý");
      }

      if (!returnItems || returnItems.length === 0) {
        throw new Error("Phải chọn ít nhất 1 sản phẩm để trả");
      }

      const returnRequest = await db.ReturnRequest.create({
        shop_order_id: shopOrderId,
        user_id: userId,
        reason,
        evidence_urls: Array.isArray(evidenceUrls) ? JSON.stringify(evidenceUrls) : evidenceUrls,
        status: "PENDING"
      }, { transaction });

      for (const reqItem of returnItems) {
        const orderItem = order.items.find(i => i.id === reqItem.orderItemId);
        if (!orderItem) throw new Error("Sản phẩm trả không thuộc đơn hàng này");
        if (reqItem.quantity <= 0 || reqItem.quantity > orderItem.quantity) {
           throw new Error(`Số lượng trả cho sản phẩm ${orderItem.product_name} không hợp lệ`);
        }

        await db.ReturnItem.create({
          return_request_id: returnRequest.id,
          order_item_id: orderItem.id,
          quantity: reqItem.quantity,
          condition_note: reqItem.note || null
        }, { transaction });
      }

      await order.update({ status: "RETURN_PENDING" }, { transaction });

      await db.ShopOrderStatusHistory.create({
        shop_order_id: shopOrderId,
        old_status: "DELIVERED",
        new_status: "RETURN_PENDING",
        changed_by: userId,
        note: "Người dùng yêu cầu trả hàng",
      }, { transaction });

      // Cập nhật ví shop
      // Chuyển từ balance sang pending_balance
      const shopWallet = await db.ShopWallet.findOne({ where: { shop_id: order.shop_id }, transaction });
      if (shopWallet) {
        const amountToFreeze = order.final_amount - order.commission_amount;
        // Thực tế chỉ nên freeze phần trả hàng nhưng để đơn giản freeze cả đơn
        if (shopWallet.balance >= amountToFreeze) {
            shopWallet.balance -= amountToFreeze;
            shopWallet.pending_balance += amountToFreeze;
            await shopWallet.save({ transaction });
        }
      }

      await transaction.commit();

      try {
        const shop = await db.Shop.findByPk(order.shop_id);
        if (shop) {
          await notificationService.createNotification(
            shop.vendor_id,
            "Yêu cầu trả hàng mới",
            `Đơn hàng ${order.shop_order_code} có yêu cầu trả hàng mới.`,
            "ORDER_UPDATE"
          );
        }
      } catch (notifErr) {
        console.error("Error sending notification:", notifErr);
      }

      return returnRequest;
    } catch (error) {
      try {
        if (transaction) await transaction.rollback();
      } catch (e) {}
      throw error;
    }
  },

  getReturnRequestsByUser: async (userId, query) => {
    const { page = 1, limit = 10, status } = query;
    const offset = (page - 1) * limit;
    
    const whereClause = { user_id: userId };
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const { count, rows } = await db.ReturnRequest.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.ShopOrder, as: "shopOrder", include: [{ model: db.Shop, as: "shop" }] },
        { 
          model: db.ReturnItem, 
          as: "items", 
          include: [{ 
            model: db.OrderItem, 
            as: "orderItem",
            include: [{
              model: db.ProductVariant,
              as: "variant",
              include: [{
                model: db.Product,
                as: "product",
                include: [{
                  model: db.ProductImage,
                  as: "images",
                  where: { is_primary: true },
                  required: false
                }]
              }]
            }]
          }] 
        }
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset: Number(offset)
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      returns: rows
    };
  },

  getReturnRequestsByShop: async (shopId, query) => {
    const { page = 1, limit = 10, status } = query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const { count, rows } = await db.ReturnRequest.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.ShopOrder, as: "shopOrder", where: { shop_id: shopId }, required: true, include: [{ model: db.User, as: "shipper" }] },
        { 
          model: db.User, 
          as: "user", 
          attributes: ["id", "email"],
          include: [{ model: db.UserProfile, as: "profile", attributes: ["full_name", "avatar_url"] }] 
        },
        { 
          model: db.ReturnItem, 
          as: "items", 
          include: [{ 
            model: db.OrderItem, 
            as: "orderItem",
            include: [{
              model: db.ProductVariant,
              as: "variant",
              include: [{
                model: db.Product,
                as: "product",
                include: [{
                  model: db.ProductImage,
                  as: "images",
                  where: { is_primary: true },
                  required: false
                }]
              }]
            }]
          }] 
        }
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset: Number(offset)
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      returns: rows
    };
  },

  getAllReturnRequestsForManager: async (query) => {
    const { page = 1, limit = 10, status } = query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    } else {
        // By default, manager only sees rejected or pending resolution
        whereClause.status = ["REJECTED", "RESOLVED_BY_ADMIN"];
    }

    const { count, rows } = await db.ReturnRequest.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.ShopOrder, as: "shopOrder", include: [{ model: db.Shop, as: "shop" }] },
        { 
          model: db.User, 
          as: "user", 
          attributes: ["id", "email"],
          include: [{ model: db.UserProfile, as: "profile", attributes: ["full_name", "avatar_url"] }] 
        },
        { 
          model: db.ReturnItem, 
          as: "items", 
          include: [{ 
            model: db.OrderItem, 
            as: "orderItem",
            include: [{
              model: db.ProductVariant,
              as: "variant",
              include: [{
                model: db.Product,
                as: "product",
                include: [{
                  model: db.ProductImage,
                  as: "images",
                  where: { is_primary: true },
                  required: false
                }]
              }]
            }]
          }] 
        }
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset: Number(offset)
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      returns: rows
    };
  },

  getReturnRequestDetail: async (id) => {
    const result = await db.ReturnRequest.findOne({
      where: { id },
      include: [
        { model: db.ShopOrder, as: "shopOrder", include: [{ model: db.Shop, as: "shop" }] },
        { 
          model: db.User, 
          as: "user", 
          attributes: ["id", "email"],
          include: [{ model: db.UserProfile, as: "profile", attributes: ["full_name", "avatar_url"] }] 
        },
        { 
          model: db.User, 
          as: "resolver", 
          attributes: ["id", "email"],
          include: [{ model: db.UserProfile, as: "profile", attributes: ["full_name"] }] 
        },
        { model: db.ReturnItem, as: "items", include: [{ model: db.OrderItem, as: "orderItem" }] }
      ]
    });

    if (!result) throw new Error("Không tìm thấy yêu cầu trả hàng");
    return result;
  },

  vendorApproveReturn: async (shopId, returnRequestId) => {
    const transaction = await db.sequelize.transaction();
    try {
      const returnRequest = await db.ReturnRequest.findOne({
        where: { id: returnRequestId, status: "PENDING" },
        include: [
          { model: db.ShopOrder, as: "shopOrder", where: { shop_id: shopId }, required: true, include: [{ model: db.ParentOrder, as: "parentOrder" }] },
          { model: db.ReturnItem, as: "items", include: [{ model: db.OrderItem, as: "orderItem" }]}
        ],
        transaction
      });

      if (!returnRequest) throw new Error("Yêu cầu trả hàng không hợp lệ hoặc đã được xử lý");

      await returnRequest.update({ status: "APPROVED_BY_SHOP", resolved_by: null }, { transaction });
      
      await returnService._processRefundAndRestock(returnRequest, transaction);
      
      await returnRequest.update({ status: "COMPLETED" }, { transaction });

      await transaction.commit();
      return returnRequest;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  vendorRejectReturn: async (shopId, returnRequestId, rejectNote) => {
    const transaction = await db.sequelize.transaction();
    try {
        const returnRequest = await db.ReturnRequest.findOne({
            where: { id: returnRequestId, status: "PENDING" },
            include: [{ model: db.ShopOrder, as: "shopOrder", where: { shop_id: shopId }, required: true }],
            transaction
        });
    
        if (!returnRequest) throw new Error("Yêu cầu trả hàng không hợp lệ hoặc đã được xử lý");
    
        await returnRequest.update({ status: "REJECTED", resolve_note: rejectNote }, { transaction });
        
        await transaction.commit();
        return returnRequest;
    } catch(err) {
        await transaction.rollback();
        throw err;
    }
  },

  managerResolveReturn: async (managerId, returnRequestId, approved, resolveNote) => {
    const transaction = await db.sequelize.transaction();
    try {
      const returnRequest = await db.ReturnRequest.findOne({
        where: { id: returnRequestId, status: "REJECTED" },
        include: [
          { model: db.ShopOrder, as: "shopOrder", include: [{ model: db.ParentOrder, as: "parentOrder" }] },
          { model: db.ReturnItem, as: "items", include: [{ model: db.OrderItem, as: "orderItem" }]}
        ],
        transaction
      });

      if (!returnRequest) throw new Error("Yêu cầu trả hàng không hợp lệ hoặc không ở trạng thái tranh chấp");

      if (approved) {
        await returnService._processRefundAndRestock(returnRequest, transaction);
        await returnRequest.update({ status: "RESOLVED_BY_ADMIN", resolved_by: managerId, resolve_note: resolveNote }, { transaction });
      } else {
        await returnRequest.update({ status: "RESOLVED_BY_ADMIN", resolved_by: managerId, resolve_note: resolveNote }, { transaction });
        
        const shopOrder = returnRequest.shopOrder;
        await shopOrder.update({ status: "DELIVERED" }, { transaction });
        await db.ShopOrderStatusHistory.create({
            shop_order_id: shopOrder.id,
            old_status: "RETURN_PENDING",
            new_status: "DELIVERED",
            changed_by: managerId,
            note: "Quản trị viên từ chối trả hàng",
        }, { transaction });

        // Unfreeze pending balance for shop
        const shopWallet = await db.ShopWallet.findOne({ where: { shop_id: shopOrder.shop_id }, transaction });
        if (shopWallet) {
            const amountToUnfreeze = shopOrder.final_amount - shopOrder.commission_amount;
            if (shopWallet.pending_balance >= amountToUnfreeze) {
                shopWallet.pending_balance -= amountToUnfreeze;
                shopWallet.balance += amountToUnfreeze;
                await shopWallet.save({ transaction });
            }
        }
      }

      await transaction.commit();
      return returnRequest;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  _processRefundAndRestock: async (returnRequest, transaction) => {
    const shopOrder = returnRequest.shopOrder;
    
    // Calculate total return value
    let returnAmount = 0;
    for (const item of returnRequest.items) {
      // Restock
      if (item.orderItem && item.orderItem.variant_id) {
        await db.ProductVariant.increment("stock_quantity", {
          by: item.quantity,
          where: { id: item.orderItem.variant_id },
          transaction
        });
      }
      
      const itemSubtotal = item.quantity * item.orderItem.unit_price;
      returnAmount += itemSubtotal;
    }

    // Proportion of final_amount
    const returnRatio = returnAmount / shopOrder.subtotal;
    const finalReturnAmount = shopOrder.final_amount * returnRatio;
    
    const pointsUsedReturned = Math.floor(shopOrder.points_used * returnRatio);
    const pointsEarnedDeducted = Math.floor(shopOrder.points_earned * returnRatio);
    
    const redeemRateSetting = await db.SystemSetting.findOne({ where: { setting_key: 'LOYALTY_POINT_REDEEM_RATE' } });
    const redeemRate = redeemRateSetting ? Number(redeemRateSetting.setting_value) : 100;

    let pointsToRefund = pointsUsedReturned;
    pointsToRefund += Math.floor(finalReturnAmount / redeemRate);

    // Update User points
    const user = await db.User.findByPk(returnRequest.user_id, { transaction });
    if (user) {
        user.loyalty_points = Math.max(0, user.loyalty_points + pointsToRefund - pointsEarnedDeducted);
        await user.save({ transaction });
    }
    
    // Deduct pending_balance from shop
    const shopWallet = await db.ShopWallet.findOne({ where: { shop_id: shopOrder.shop_id }, transaction });
    if (shopWallet) {
        const frozenAmount = shopOrder.final_amount - shopOrder.commission_amount;
        const actualRefundToUserFromShop = finalReturnAmount - (shopOrder.commission_amount * returnRatio);
        
        // We deduct the refunded portion from pending_balance and return the rest to balance
        if (shopWallet.pending_balance >= frozenAmount) {
            shopWallet.pending_balance -= frozenAmount;
            shopWallet.balance += (frozenAmount - actualRefundToUserFromShop);
            await shopWallet.save({ transaction });
        }
    }

    // Update ShopOrder status
    await shopOrder.update({ status: "RETURNED" }, { transaction });

    await db.ShopOrderStatusHistory.create({
      shop_order_id: shopOrder.id,
      old_status: "RETURN_PENDING",
      new_status: "RETURNED",
      changed_by: returnRequest.user_id,
      note: "Yêu cầu trả hàng hoàn tất",
    }, { transaction });
  }
};

export default returnService;
