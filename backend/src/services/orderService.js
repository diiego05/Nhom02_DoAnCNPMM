import db from "../models/index.js";
import cartService from "./cartService.js";

const generateOrderCode = (prefix = "ORD") => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
};

const calculateCheckout = async (userId, { items, platformCouponCode, shopCoupons, usePoints }) => {
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
      total_price: itemTotal
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
    if (platformCouponObj && parentSubtotal >= platformCouponObj.min_order_amount) {
      const discount = platformCouponObj.discount_type === 'PERCENT'
          ? (parentSubtotal * Number(platformCouponObj.discount_value) / 100)
          : Number(platformCouponObj.discount_value);
      platformDiscount = platformCouponObj.max_discount ? Math.min(discount, Number(platformCouponObj.max_discount)) : discount;
    }
  }

  // 5. Apply Points
  let pointsDiscount = 0;
  if (usePoints) {
    const user = await db.User.findByPk(userId);
    if (user && user.loyalty_points > 0) {
      pointsDiscount = user.loyalty_points * 100; // 1 point = 100 VND
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
    isCartCheckout
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
    const totalPointsToUse = calcResult.pointsDiscount > 0 ? Math.ceil(calcResult.pointsDiscount / 100) : 0;
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
      const shopPointsEarned = Math.floor(shop.final_amount / 10000);

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

    await transaction.commit();
    return parentOrder;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserOrders = async (userId, { page = 1, limit = 10, status }) => {
  const where = {};
  if (status) where.status = status;

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
      { model: db.Shop, as: "shop", paranoid: false }
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

const updateOrderStatus = async (shopOrderId, userId, newStatus, role) => {
  const shopOrder = await db.ShopOrder.findByPk(shopOrderId, {
    include: [{ model: db.ParentOrder, as: "parentOrder" }]
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
  await shopOrder.update({ status: newStatus });

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
  });

  return shopOrder;
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
      { model: db.ParentOrder, as: "parentOrder", attributes: ['shipping_address', 'payment_method', 'payment_status', 'user_id', 'note'] }
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

  return shopOrder;
};

export default { calculateCheckout, createOrder, getUserOrders, updateOrderStatus, getOrderDetail, cancelOrder };
