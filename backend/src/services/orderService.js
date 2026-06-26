import db from "../models/index.js";
import cartService from "./cartService.js";
import notificationService from "./notificationService.js";

const generateOrderCode = (prefix = "ORD") => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
};

const calculateCheckout = async (userId, { items, platformCouponCode, shopCoupons, usePoints }) => {
  // Fetch loyalty points settings once
  const earnRateSetting = await db.SystemSetting.findOne({ where: { setting_key: 'LOYALTY_POINT_EARN_RATE' } });
  const redeemRateSetting = await db.SystemSetting.findOne({ where: { setting_key: 'LOYALTY_POINT_REDEEM_RATE' } });
  const earnRate = earnRateSetting ? Number(earnRateSetting.setting_value) : 10000;
  const redeemRate = redeemRateSetting ? Number(redeemRateSetting.setting_value) : 100;

  let isCartCheckout = false;
  let rawItems = [];

  if (items && items.length > 0) {
    rawItems = items;
  } else {
    isCartCheckout = true;
    const cartData = await cartService.getCartByUserId(userId);
    if (!cartData.items || cartData.items.length === 0) throw new Error("Giỏ hàng trống");
    rawItems = cartData.items;
  }

  // 1. Fetch details & group by Shop
  const shopsData = {};
  for (const item of rawItems) {
    const product = await db.Product.findByPk(item.product_id, {
      include: [{ model: db.Shop, as: "shop" }]
    });
    if (!product || product.approval_status !== "APPROVED") throw new Error(`Sản phẩm ${item.product_id} không hợp lệ`);
    
    let variant = null;
    let price = 0;
    
    if (item.product_variant_id || item.variant_id) {
      variant = await db.ProductVariant.findByPk(item.product_variant_id || item.variant_id);
      if (!variant || variant.product_id !== product.id) throw new Error("Biến thể không hợp lệ");
      price = variant.price;
    } else {
      variant = await db.ProductVariant.findOne({ where: { product_id: product.id } });
      if (!variant) throw new Error("Sản phẩm không có biến thể");
      price = variant.price;
    }

    const shopId = product.shop_id;
    if (!shopsData[shopId]) {
      shopsData[shopId] = {
        shop_id: shopId,
        shop_name: product.shop.shop_name,
        items: [],
        subtotal: 0,
        shipping_fee: 30000, // Fixed logic for now
        shop_discount: 0,
        shop_coupon_id: null,
      };
    }

    const itemTotal = item.quantity * Number(price);
    shopsData[shopId].subtotal += itemTotal;
    shopsData[shopId].items.push({
      product_id: product.id,
      variant_id: variant.id,
      product_name: product.name,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      unit_price: Number(price),
      total_price: itemTotal,
      category_id: product.category_id
    });
  }

  // 2. Apply Shop Coupons
  if (shopCoupons && Object.keys(shopCoupons).length > 0) {
    for (const [shopId, code] of Object.entries(shopCoupons)) {
      if (shopsData[shopId]) {
        const coupon = await db.Coupon.findOne({ where: { code, shop_id: shopId } });
        if (coupon && shopsData[shopId].subtotal >= coupon.min_order_amount) {
           const discount = coupon.discount_type === 'PERCENT' 
              ? (shopsData[shopId].subtotal * Number(coupon.discount_value) / 100)
              : Number(coupon.discount_value);
           shopsData[shopId].shop_discount = coupon.max_discount ? Math.min(discount, Number(coupon.max_discount)) : discount;
           shopsData[shopId].shop_coupon_id = coupon.id;
        }
      }
    }
  }

  // 3. Calculate Parent totals
  let parentSubtotal = 0;
  let totalShippingFee = 0;
  let totalShopDiscount = 0;

  for (const shop of Object.values(shopsData)) {
    shop.final_amount = shop.subtotal + shop.shipping_fee - shop.shop_discount;
    parentSubtotal += shop.subtotal;
    totalShippingFee += shop.shipping_fee;
    totalShopDiscount += shop.shop_discount;
  }

  // 4. Apply Platform Coupon
  let platformDiscount = 0;
  let platformCouponObj = null;
  if (platformCouponCode) {
    platformCouponObj = await db.Coupon.findOne({ where: { code: platformCouponCode, shop_id: null } });
    if (platformCouponObj) {
      let validSubtotal = parentSubtotal;
      
      // Nếu có giới hạn danh mục
      if (platformCouponObj.category_id) {
        validSubtotal = 0;
        for (const shop of Object.values(shopsData)) {
          for (const item of shop.items) {
            if (item.category_id === platformCouponObj.category_id) {
              validSubtotal += item.total_price;
            }
          }
        }
      }

      if (validSubtotal >= platformCouponObj.min_order_amount) {
        const discount = platformCouponObj.discount_type === 'PERCENT'
            ? (validSubtotal * Number(platformCouponObj.discount_value) / 100)
            : Number(platformCouponObj.discount_value);
        platformDiscount = platformCouponObj.max_discount ? Math.min(discount, Number(platformCouponObj.max_discount)) : discount;
      } else if (platformCouponObj.category_id && validSubtotal === 0) {
        throw new Error("Mã giảm giá sàn không áp dụng cho danh mục sản phẩm bạn đang mua");
      } else {
        throw new Error(`Đơn hàng chưa đạt mức tối thiểu ${platformCouponObj.min_order_amount}₫ để áp dụng mã giảm giá này`);
      }
    }
  }

  // 5. Apply Points
  let pointsDiscount = 0;
  if (usePoints) {
    const user = await db.User.findByPk(userId);
    if (user && user.loyalty_points > 0) {
      pointsDiscount = user.loyalty_points * redeemRate; // Dynamically calculated
      // Ensure points don't exceed the total order amount
      const remainingTotal = parentSubtotal + totalShippingFee - totalShopDiscount - platformDiscount;
      if (pointsDiscount > remainingTotal) {
        pointsDiscount = remainingTotal;
      }
    }
  }

  const finalTotalAmount = parentSubtotal + totalShippingFee - totalShopDiscount - platformDiscount - pointsDiscount;

  return {
    shops: Object.values(shopsData),
    parentSubtotal,
    totalShippingFee,
    totalShopDiscount,
    platformDiscount,
    pointsDiscount,
    platformCoupon: platformCouponObj ? { id: platformCouponObj.id, code: platformCouponObj.code } : null,
    totalAmount: finalTotalAmount > 0 ? finalTotalAmount : 0,
    isCartCheckout,
    earnRate,
    redeemRate
  };
};

const createOrder = async (userId, data) => {
  const { paymentMethod = "COD", addressId, platformCouponCode, shopCoupons, items, usePoints, note } = data;
  
  const calcResult = await calculateCheckout(userId, { items, platformCouponCode, shopCoupons, usePoints });
  const address = await db.UserAddress.findByPk(addressId);
  if (!address) throw new Error("Địa chỉ không hợp lệ");
  
  const shippingAddressStr = `${address.receiver_name}, ${address.phone}, ${address.street || ''}, ${address.ward}, ${address.district}, ${address.province}`;

  const transaction = await db.sequelize.transaction();
  try {
    // 1. Create Parent Order
    const parentOrder = await db.ParentOrder.create({
      user_id: userId,
      address_id: addressId,
      checkout_code: generateOrderCode("CHK"),
      total_amount: calcResult.totalAmount,
      payment_method: paymentMethod,
      payment_status: "UNPAID",
      shipping_address: shippingAddressStr,
      platform_coupon_id: calcResult.platformCoupon?.id || null,
      note: note || null,
    }, { transaction });

    // Calculate total points to be distributed
    const totalPointsToUse = calcResult.pointsDiscount > 0 ? Math.ceil(calcResult.pointsDiscount / calcResult.redeemRate) : 0;
    let pointsUsedRemaining = totalPointsToUse;

    // Deduct total used points from user immediately (since they are spending it now)
    if (totalPointsToUse > 0) {
      await db.User.decrement('loyalty_points', { by: totalPointsToUse, where: { id: userId }, transaction });
    }

    // 2. Create Shop Orders
    for (let i = 0; i < calcResult.shops.length; i++) {
      const shop = calcResult.shops[i];
      // Get commission rate
      const platformComm = await db.PlatformCommission.findOne({ where: { shop_id: shop.shop_id } });
      const commissionRate = platformComm ? Number(platformComm.commission_rate) : 10.0;
      const commissionAmount = (shop.final_amount * commissionRate) / 100;

      // Distribute points_used (assign to first shop, or distribute proportionally)
      // Here we just distribute it proportionally based on final amount, or simpler: give all remaining to the last shop.
      let shopPointsUsed = 0;
      if (pointsUsedRemaining > 0) {
        if (i === calcResult.shops.length - 1) {
          shopPointsUsed = pointsUsedRemaining;
        } else {
          shopPointsUsed = Math.floor(totalPointsToUse * (shop.final_amount / calcResult.totalAmount));
          pointsUsedRemaining -= shopPointsUsed;
        }
      }

      // Calculate earned points for THIS shop order
      const shopPointsEarned = Math.floor(shop.final_amount / calcResult.earnRate);

      const shopOrder = await db.ShopOrder.create({
        parent_order_id: parentOrder.id,
        shop_id: shop.shop_id,
        shop_order_code: generateOrderCode("SHOP"),
        subtotal: shop.subtotal,
        shipping_fee: shop.shipping_fee,
        discount_amount: shop.shop_discount,
        final_amount: shop.final_amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        shop_coupon_id: shop.shop_coupon_id,
        points_used: shopPointsUsed,
        points_earned: shopPointsEarned,
        status: "PENDING",
      }, { transaction });

      // Create Order Items
      const orderItems = shop.items.map(item => ({
        shop_order_id: shopOrder.id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));
      await db.OrderItem.bulkCreate(orderItems, { transaction });

      // Status History
      await db.ShopOrderStatusHistory.create({
        shop_order_id: shopOrder.id,
        new_status: "PENDING",
        note: "Đơn hàng mới được tạo",
      }, { transaction });

      // Gửi thông báo cho Vendor
      const shopObj = await db.Shop.findByPk(shop.shop_id, { transaction });
      if (shopObj && shopObj.vendor_id) {
        try {
          await notificationService.createNotification(
            shopObj.vendor_id,
            "Đơn hàng mới chờ xử lý",
            `Gian hàng của bạn nhận được đơn hàng mới mã ${shopOrder.shop_order_code} trị giá ${Number(shopOrder.final_amount).toLocaleString()}₫.`,
            "NEW_ORDER"
          );
        } catch (notifErr) {
          console.error("Failed to create vendor order notification:", notifErr);
        }
      }

      // Deduct stock
      for (const item of shop.items) {
        await db.ProductVariant.decrement("stock_quantity", {
          by: item.quantity,
          where: { id: item.variant_id },
          transaction,
        });
      }
    }

    if (data.is_cart_checkout) {
      // Vì hiện tại frontend chưa hỗ trợ thanh toán từng phần giỏ hàng, nên ta xóa luôn toàn bộ giỏ hàng
      await db.CartItem.destroy({ where: { user_id: userId }, transaction });
    }

    // Tạo PaymentLog ban đầu
    await db.PaymentLog.create({
      order_code: parentOrder.checkout_code,
      gateway_name: paymentMethod,
      amount: parentOrder.total_amount,
      status: "UNPAID",
      message: paymentMethod === "COD" ? "Khởi tạo đơn hàng thanh toán khi nhận hàng" : "Đang chờ thanh toán trực tuyến",
    }, { transaction });

    await transaction.commit();

    // Gửi thông báo cho User (người mua) đặt hàng thành công
    try {
      await notificationService.createNotification(
        userId,
        "Đặt hàng thành công",
        `Bạn đã đặt thành công đơn hàng checkout ${parentOrder.checkout_code} trị giá ${Number(parentOrder.total_amount).toLocaleString()}₫. Vui lòng chờ shop xác nhận.`,
        "NEW_ORDER"
      );
    } catch (notifErr) {
      console.error("Failed to create user order notification:", notifErr);
    }

    return parentOrder;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserOrders = async (userId, { page = 1, limit = 10, status }) => {
  const where = {};
  if (status) {
    if (status === 'PREPARING') {
      where.status = ['PREPARING', 'READY_FOR_PICKUP'];
    } else {
      where.status = status;
    }
  }

  // Find ParentOrders first
  const parentOrders = await db.ParentOrder.findAll({
    where: { user_id: userId },
    attributes: ['id']
  });
  const parentIds = parentOrders.map(p => p.id);

  if (parentIds.length > 0) {
    where.parent_order_id = { [db.Sequelize.Op.in]: parentIds };
  } else {
    return { total: 0, totalPages: 0, currentPage: parseInt(page), orders: [] };
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await db.ShopOrder.findAndCountAll({
    where,
    include: [
      { 
        model: db.OrderItem, 
        as: "items",
        include: [
          {
            model: db.ProductVariant,
            as: "variant",
            paranoid: false,
            include: [
              {
                model: db.Product,
                as: "product",
                paranoid: false,
                include: [{ model: db.ProductImage, as: "images" }]
              }
            ]
          }
        ]
      }, 
      { model: db.Shop, as: "shop", paranoid: false },
      { model: db.ParentOrder, as: "parentOrder", paranoid: false }
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    orders: rows,
  };
};

const updateOrderStatus = async (shopOrderId, userId, newStatus, role, note = null) => {
  const shopOrder = await db.ShopOrder.findByPk(shopOrderId, {
    include: [{ model: db.ParentOrder, as: "parentOrder" }, { model: db.OrderItem, as: "items" }]
  });
  if (!shopOrder) throw new Error("Không tìm thấy đơn hàng");

  if (role === "vendor") {
    const userShop = await db.Shop.findOne({ where: { vendor_id: userId } });
    if (!userShop || userShop.id !== shopOrder.shop_id) {
       throw new Error("Không có quyền cập nhật đơn hàng này");
    }
  } else if (role === "user") {
    if (shopOrder.parentOrder.user_id !== userId) {
      throw new Error("Không có quyền cập nhật đơn hàng này");
    }
  } else if (role === "shipper") {
    if (shopOrder.shipper_id !== userId && shopOrder.status !== "READY_FOR_PICKUP") {
      throw new Error("Không có quyền cập nhật đơn hàng này");
    }
  }

  const oldStatus = shopOrder.status;
  const updateData = { status: newStatus };
  
  // Always set shipper_id if status changes to DELIVERING and user has shipper permissions (or is currently updating as shipper)
  if ((role === "shipper" || newStatus === "DELIVERING") && oldStatus === "READY_FOR_PICKUP" && !shopOrder.shipper_id) {
    updateData.shipper_id = userId;
  }
  
  await shopOrder.update(updateData);

  // Add loyalty points when delivered successfully
  if (newStatus === "DELIVERED" && oldStatus !== "DELIVERED") {
    if (shopOrder.points_earned && shopOrder.points_earned > 0) {
      await db.User.increment('loyalty_points', { by: shopOrder.points_earned, where: { id: shopOrder.parentOrder.user_id } });
    }
  }

  // Refund points when cancelled
  if (newStatus === "CANCELLED" && oldStatus !== "CANCELLED") {
    if (shopOrder.points_used && shopOrder.points_used > 0) {
      await db.User.increment('loyalty_points', { by: shopOrder.points_used, where: { id: shopOrder.parentOrder.user_id } });
    }
    // Restore stock
    const orderItems = await db.OrderItem.findAll({ where: { shop_order_id: shopOrderId } });
    for (const item of orderItems) {
      if (item.variant_id) {
        await db.ProductVariant.increment("stock_quantity", {
          by: item.quantity,
          where: { id: item.variant_id },
          paranoid: false,
        });
      }
    }
  }

  await db.ShopOrderStatusHistory.create({
    shop_order_id: shopOrderId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: userId,
    note: note,
  });

  // Tạo thông báo khi cập nhật trạng thái đơn hàng
  try {
    const shopObj = await db.Shop.findByPk(shopOrder.shop_id);
    const vendorId = shopObj?.vendor_id;
    const customerId = shopOrder.parentOrder?.user_id;

    // 1. Thông báo cho người thực hiện (userId)
    let actorTitle = "Cập nhật đơn hàng";
    let actorContent = `Bạn đã cập nhật đơn hàng ${shopOrder.shop_order_code} sang trạng thái ${newStatus}.`;
    if (userId === vendorId) {
      if (newStatus === "CONFIRMED") {
        actorTitle = "Xác nhận đơn hàng";
        actorContent = `Bạn đã xác nhận đơn hàng ${shopOrder.shop_order_code}.`;
      } else if (newStatus === "PREPARING") {
        actorTitle = "Chuẩn bị hàng xong";
        actorContent = `Bạn đã chuẩn bị xong hàng cho đơn ${shopOrder.shop_order_code} và sẵn sàng giao cho shipper.`;
      }
    } else if (userId === customerId) {
      if (newStatus === "DELIVERED") {
        actorTitle = "Xác nhận nhận hàng";
        actorContent = `Bạn đã xác nhận đã nhận được đơn hàng ${shopOrder.shop_order_code}.`;
      } else if (newStatus === "CANCELLED") {
        actorTitle = "Hủy đơn hàng";
        actorContent = `Bạn đã hủy đơn hàng ${shopOrder.shop_order_code}.`;
      }
    } else if (shopOrder.shipper_id === userId || (role === "shipper" && newStatus === "SHIPPED")) {
      if (newStatus === "SHIPPED") {
        actorTitle = "Nhận đơn giao hàng";
        actorContent = `Bạn đã nhận giao đơn hàng ${shopOrder.shop_order_code} từ cửa hàng.`;
      } else if (newStatus === "DELIVERED") {
        actorTitle = "Giao hàng thành công";
        actorContent = `Bạn đã giao thành công đơn hàng ${shopOrder.shop_order_code}.`;
      } else if (newStatus === "FAILED") {
        actorTitle = "Giao hàng thất bại";
        actorContent = `Bạn đã cập nhật giao đơn hàng ${shopOrder.shop_order_code} thất bại. Lý do: ${note || "Không có lý do"}.`;
      }
    }
    await notificationService.createNotification(userId, actorTitle, actorContent, "ORDER_UPDATE");

    // 2. Thông báo cho các bên liên quan (nếu người thực hiện không phải là họ)
    if (vendorId && userId !== vendorId) {
      let vendorTitle = "Cập nhật đơn hàng";
      let vendorContent = `Đơn hàng ${shopOrder.shop_order_code} của shop đã được cập nhật sang trạng thái ${newStatus}.`;
      if (newStatus === "SHIPPED") {
        vendorTitle = "Shipper lấy hàng";
        vendorContent = `Shipper đã lấy hàng và đang đi giao đơn ${shopOrder.shop_order_code}.`;
      } else if (newStatus === "DELIVERED") {
        vendorTitle = "Đơn hàng đã giao thành công";
        vendorContent = `Khách hàng/Shipper đã xác nhận giao thành công đơn hàng ${shopOrder.shop_order_code}.`;
      } else if (newStatus === "FAILED") {
        vendorTitle = "Giao hàng thất bại";
        vendorContent = `Shipper xác nhận giao đơn hàng ${shopOrder.shop_order_code} thất bại. Lý do: ${note || "Không có lý do"}.`;
      } else if (newStatus === "CANCELLED") {
        vendorTitle = "Đơn hàng bị hủy";
        vendorContent = `Khách hàng đã hủy đơn hàng ${shopOrder.shop_order_code}.`;
      }
      await notificationService.createNotification(vendorId, vendorTitle, vendorContent, "ORDER_UPDATE");
    }

    if (customerId && userId !== customerId) {
      let customerTitle = "Trạng thái đơn hàng";
      let customerContent = `Đơn hàng ${shopOrder.shop_order_code} của bạn đã được cập nhật sang trạng thái ${newStatus}.`;
      if (newStatus === "CONFIRMED") {
        customerTitle = "Đơn hàng được xác nhận";
        customerContent = `Đơn hàng ${shopOrder.shop_order_code} đã được người bán xác nhận.`;
      } else if (newStatus === "PREPARING") {
        customerTitle = "Đang chuẩn bị hàng";
        customerContent = `Người bán đang chuẩn bị hàng cho đơn ${shopOrder.shop_order_code} của bạn.`;
      } else if (newStatus === "SHIPPED") {
        customerTitle = "Đang giao hàng";
        customerContent = `Đơn hàng ${shopOrder.shop_order_code} đang trên đường giao tới bạn.`;
      } else if (newStatus === "DELIVERED") {
        customerTitle = "Giao hàng thành công";
        customerContent = `Đơn hàng ${shopOrder.shop_order_code} đã được giao thành công. Cảm ơn bạn đã mua sắm!`;
      } else if (newStatus === "FAILED") {
        customerTitle = "Giao hàng thất bại";
        customerContent = `Giao đơn hàng ${shopOrder.shop_order_code} thất bại. Lý do: ${note || "Không có lý do"}.`;
      }
      await notificationService.createNotification(customerId, customerTitle, customerContent, "ORDER_UPDATE");
    }

    const actualShipperId = shopOrder.shipper_id || (role === "shipper" ? userId : null);
    if (actualShipperId && userId !== actualShipperId) {
      let shipperTitle = "Cập nhật trạng thái đơn";
      let shipperContent = `Đơn hàng ${shopOrder.shop_order_code} bạn đang nhận giao đã có cập nhật trạng thái mới sang ${newStatus}.`;
      await notificationService.createNotification(actualShipperId, shipperTitle, shipperContent, "ORDER_UPDATE");
    }

  } catch (notifErr) {
    console.error("Failed to create order status update notification:", notifErr);
  }

  return shopOrder;
};

const bulkUpdateOrderStatus = async (shopOrderIds, userId, newStatus, role) => {
  const results = [];
  const errors = [];
  
  for (const orderId of shopOrderIds) {
    try {
      const order = await updateOrderStatus(orderId, userId, newStatus, role);
      results.push(order);
    } catch (err) {
      errors.push({ orderId, message: err.message });
    }
  }
  
  if (results.length === 0 && errors.length > 0) {
    throw new Error(`Cập nhật thất bại: ${errors[0].message}`);
  }
  
  return { updated: results.length, errors };
};

const getShipperOrders = async (userId, { page = 1, limit = 10, status }) => {
  const profile = await db.UserProfile.findOne({ where: { user_id: userId } });
  const shipperShopId = profile?.shipper_shop_id;

  const where = {};
  if (status) {
    where.status = status;
  }

  if (shipperShopId) {
    if (status) {
      if (status === 'READY_FOR_PICKUP') {
        where.shop_id = shipperShopId;
        where.shipper_id = null;
      } else {
        where.shipper_id = userId;
      }
    } else {
      where[db.Sequelize.Op.or] = [
        {
          shop_id: shipperShopId,
          status: 'READY_FOR_PICKUP'
        },
        {
          shipper_id: userId
        }
      ];
    }
  } else {
    where.shipper_id = userId;
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await db.ShopOrder.findAndCountAll({
    where,
    include: [
      {
        model: db.OrderItem,
        as: "items",
        include: [
          {
            model: db.ProductVariant,
            as: "variant",
            paranoid: false,
            include: [
              {
                model: db.Product,
                as: "product",
                paranoid: false,
                include: [{ model: db.ProductImage, as: "images" }]
              }
            ]
          }
        ]
      },
      { model: db.Shop, as: "shop", paranoid: false },
      {
        model: db.ParentOrder,
        as: "parentOrder",
        attributes: ['id', 'shipping_address', 'payment_method', 'payment_status', 'user_id', 'note']
      }
    ],
    order: [["updated_at", "DESC"]],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    orders: rows,
  };
};

const getOrderDetail = async (shopOrderId, userId) => {
  const shopOrder = await db.ShopOrder.findOne({
    where: { id: shopOrderId },
    include: [
      { 
        model: db.OrderItem, 
        as: "items",
        include: [
          {
            model: db.ProductVariant,
            as: "variant",
            paranoid: false,
            include: [
              {
                model: db.Product,
                as: "product",
                paranoid: false,
                include: [{ model: db.ProductImage, as: "images" }]
              }
            ]
          }
        ]
      }, 
      { model: db.Shop, as: "shop", paranoid: false },
      { model: db.ParentOrder, as: "parentOrder", attributes: ['id', 'shipping_address', 'payment_method', 'payment_status', 'user_id', 'note'] }
    ]
  });

  if (!shopOrder) throw new Error("Không tìm thấy đơn hàng");
  if (shopOrder.parentOrder.user_id !== userId) throw new Error("Không có quyền xem đơn hàng này");

  return shopOrder;
};

const cancelOrder = async (shopOrderId, userId, reason) => {
  const shopOrder = await db.ShopOrder.findByPk(shopOrderId, {
    include: [{ model: db.ParentOrder, as: "parentOrder" }]
  });
  if (!shopOrder) throw new Error("Không tìm thấy đơn hàng");
  if (shopOrder.parentOrder.user_id !== userId) throw new Error("Không có quyền hủy đơn hàng này");

  const isPreparing = shopOrder.status === 'PREPARING';
  const newStatus = isPreparing ? 'CANCEL_REQUESTED' : 'CANCELLED';

  const oldStatus = shopOrder.status;
  await shopOrder.update({ status: newStatus });

  // Refund points when cancelled
  if (newStatus === "CANCELLED" && oldStatus !== "CANCELLED") {
    if (shopOrder.points_used && shopOrder.points_used > 0) {
      await db.User.increment('loyalty_points', { by: shopOrder.points_used, where: { id: shopOrder.parentOrder.user_id } });
    }
    // Restore stock
    const orderItems = await db.OrderItem.findAll({ where: { shop_order_id: shopOrderId } });
    for (const item of orderItems) {
      if (item.variant_id) {
        await db.ProductVariant.increment("stock_quantity", {
          by: item.quantity,
          where: { id: item.variant_id },
          paranoid: false,
        });
      }
    }
  }

  await db.ShopOrderStatusHistory.create({
    shop_order_id: shopOrderId,
    old_status: oldStatus,
    new_status: newStatus,
    note: reason || (isPreparing ? "Người dùng yêu cầu hủy" : "Người dùng hủy đơn"),
    changed_by: userId,
  });

  // Gửi thông báo
  try {
    // 1. Cho User (chính chủ)
    await notificationService.createNotification(
      userId,
      isPreparing ? "Yêu cầu hủy đơn hàng" : "Hủy đơn hàng thành công",
      isPreparing 
        ? `Bạn đã gửi yêu cầu hủy đơn hàng ${shopOrder.shop_order_code}. Vui lòng chờ shop xác nhận.`
        : `Bạn đã hủy đơn hàng ${shopOrder.shop_order_code} thành công.`,
      "ORDER_UPDATE"
    );

    // 2. Cho Vendor
    const shop = await db.Shop.findByPk(shopOrder.shop_id);
    if (shop && shop.vendor_id) {
      await notificationService.createNotification(
        shop.vendor_id,
        isPreparing ? "Yêu cầu hủy đơn từ khách" : "Khách hàng hủy đơn hàng",
        isPreparing
          ? `Khách hàng yêu cầu hủy đơn hàng ${shopOrder.shop_order_code} (đơn hàng đã ở trạng thái chuẩn bị hàng).`
          : `Khách hàng đã hủy đơn hàng ${shopOrder.shop_order_code}.`,
        "ORDER_UPDATE"
      );
    }
  } catch (notifErr) {
    console.error("Failed to create cancelOrder notifications:", notifErr);
  }

  return shopOrder;
};

export default { calculateCheckout, createOrder, getUserOrders, updateOrderStatus, getOrderDetail, cancelOrder, getShipperOrders, bulkUpdateOrderStatus };
