import db from "../models/index.js";
import cartService from "./cartService.js";

// Tạo mã đơn hàng duy nhất
const generateOrderCode = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${random}`;
};

// Tính toán hóa đơn tạm tính
const calculateCheckout = async (userId, { items, couponCode, usePoints }) => {
  let orderItemsData = [];
  let isCartCheckout = false;

  // 1. Chuẩn bị dữ liệu Order Items
  if (items && items.length > 0) {
    for (const item of items) {
      const product = await db.Product.findByPk(item.product_id);
      if (!product || product.status !== "ACTIVE") throw new Error("Sản phẩm không hợp lệ");
      let variant = null;
      let price = product.sale_price || product.price;

      if (item.product_variant_id) {
        variant = await db.ProductVariant.findByPk(item.product_variant_id);
        if (!variant) throw new Error("Biến thể không hợp lệ");
        price = variant.price || price;
      }

      orderItemsData.push({
        quantity: item.quantity,
        total_price: item.quantity * Number(price),
      });
    }
  } else {
    isCartCheckout = true;
    const cartData = await cartService.getCartByUserId(userId);
    if (!cartData.items || cartData.items.length === 0) throw new Error("Giỏ hàng trống");
    for (const item of cartData.items) {
      orderItemsData.push({
        quantity: item.quantity,
        total_price: item.quantity * Number(item.unit_price),
      });
    }
  }

  // 2. Tính tiền cơ bản
  const subtotal = orderItemsData.reduce((sum, item) => sum + item.total_price, 0);
  let shippingFee = subtotal >= 500000 ? 0 : 30000;

  // 3. Áp dụng Coupon
  let discountAmount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await db.Coupon.findOne({
      where: { code: couponCode, is_active: true }
    });
    if (!coupon) throw new Error("Mã giảm giá không hợp lệ");
    if (new Date() < coupon.start_date || new Date() > coupon.end_date) throw new Error("Mã giảm giá đã hết hạn hoặc chưa bắt đầu");
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) throw new Error("Mã giảm giá đã hết lượt sử dụng chung");
    if (subtotal < coupon.min_order_amount) throw new Error(`Đơn hàng chưa đạt mức tối thiểu ${coupon.min_order_amount}đ để áp dụng mã`);

    const userUsage = await db.UserCouponUsage.count({ where: { user_id: userId, coupon_id: coupon.id } });
    if (userUsage >= coupon.per_user_limit) throw new Error("Bạn đã hết lượt sử dụng mã này");

    if (coupon.discount_type === 'PERCENTAGE') {
      discountAmount = subtotal * (Number(coupon.discount_value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) discountAmount = Number(coupon.max_discount);
    } else {
      discountAmount = Number(coupon.discount_value);
    }
  }

  // 4. Áp dụng Điểm
  let pointsUsed = 0;
  let pointsDiscount = 0;
  let remainingAfterCoupon = subtotal - discountAmount;
  if (remainingAfterCoupon < 0) remainingAfterCoupon = 0;

  const user = await db.User.findByPk(userId);
  if (usePoints && user.loyalty_points > 0) {
    // 1 điểm = 1 VND
    const maxPointsCanUse = Math.min(user.loyalty_points, remainingAfterCoupon);
    pointsUsed = maxPointsCanUse;
    pointsDiscount = maxPointsCanUse;
  }

  const finalTotalAmount = remainingAfterCoupon + shippingFee - pointsDiscount;

  return {
    subtotal,
    shippingFee,
    discountAmount,
    coupon: coupon ? { id: coupon.id, code: coupon.code } : null,
    pointsUsed,
    pointsDiscount,
    totalAmount: finalTotalAmount > 0 ? finalTotalAmount : 0,
  };
};

// Tạo đơn hàng từ giỏ hàng hoặc từ danh sách items cụ thể
const createOrder = async (
  userId,
  {
    paymentMethod = "COD",
    shippingAddress,
    recipientName,
    recipientPhone,
    note,
    items,
    couponCode,
    usePoints,
    isCartCheckout = false,
  },
) => {
  let orderItemsData = [];

  // 1. Chuẩn bị dữ liệu Order Items
  if (items && items.length > 0) {
    // Thanh toán Mua ngay (hoặc các item được chọn)
    for (const item of items) {
      const product = await db.Product.findByPk(item.product_id, {
        include: [{ model: db.ProductImage, as: "images", where: { is_primary: true }, required: false }]
      });
      if (!product || product.status !== "ACTIVE") {
        throw new Error(`Sản phẩm không hợp lệ: ${item.product_id}`);
      }

      let variant = null;
      let stock = product.stock_quantity;
      let price = product.sale_price || product.price;

      if (item.product_variant_id) {
        variant = await db.ProductVariant.findByPk(item.product_variant_id);
        if (!variant || variant.product_id !== product.id) {
          throw new Error("Biến thể không hợp lệ");
        }
        stock = variant.stock_quantity;
        price = variant.price || price;
      }

      if (item.quantity > stock) {
        throw new Error(`Sản phẩm "${product.name}" chỉ còn ${stock} trong kho`);
      }

      orderItemsData.push({
        product_id: product.id,
        product_variant_id: variant?.id || null,
        product_name: product.name,
        variant_color: variant?.color || null,
        variant_size: variant?.size || null,
        product_image_url: product.images?.[0]?.image_url || null,
        quantity: item.quantity,
        unit_price: Number(price),
        total_price: item.quantity * Number(price),
      });
    }
  } else {
    // Thanh toán toàn bộ giỏ hàng
    isCartCheckout = true;
    const cartData = await cartService.getCartByUserId(userId);
    if (!cartData.items || cartData.items.length === 0) {
      throw new Error("Giỏ hàng trống, không thể đặt hàng");
    }

    for (const item of cartData.items) {
      const stock = item.variant ? item.variant.stock_quantity : item.product?.stock_quantity || 0;
      if (item.quantity > stock) {
        throw new Error(`Sản phẩm "${item.product?.name}" chỉ còn ${stock} trong kho`);
      }
      orderItemsData.push({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        product_name: item.product?.name || "Sản phẩm",
        variant_color: item.variant?.color || null,
        variant_size: item.variant?.size || null,
        product_image_url: item.product?.images?.[0]?.image_url || null,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total_price: item.quantity * Number(item.unit_price),
      });
    }
  }

  // 2. Gọi calculateCheckout để xác định các loại phí, chiết khấu
  const calcResult = await calculateCheckout(userId, { items, couponCode, usePoints });
  const { subtotal, shippingFee, discountAmount, pointsUsed, pointsDiscount, totalAmount } = calcResult;
  const couponId = calcResult.coupon ? calcResult.coupon.id : null;

  // 3. Tạo đơn hàng (dùng Transaction để đảm bảo toàn vẹn dữ liệu)
  const transaction = await db.sequelize.transaction();
  try {
    const order = await db.Order.create(
      {
        user_id: userId,
        order_code: generateOrderCode(),
        status: "PENDING",
        payment_method: paymentMethod,
        payment_status: "UNPAID",
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        shipping_address: shippingAddress,
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        note: note || null,
        coupon_id: couponId,
        points_used: pointsUsed,
        points_discount: pointsDiscount,
      },
      { transaction },
    );

    // 4. Tạo order_items
    const orderItems = orderItemsData.map((item) => ({ ...item, order_id: order.id }));
    await db.OrderItem.bulkCreate(orderItems, { transaction });

    // 5. Ghi log trạng thái đầu tiên
    await db.OrderStatusLog.create(
      {
        order_id: order.id,
        from_status: null,
        to_status: "PENDING",
        changed_by: null,
        note: "Đơn hàng mới được tạo",
      },
      { transaction },
    );

    // 6. Trừ tồn kho và tăng sold_count
    for (const item of orderItemsData) {
      if (item.product_variant_id) {
        await db.ProductVariant.decrement("stock_quantity", {
          by: item.quantity,
          where: { id: item.product_variant_id },
          transaction,
        });
      } else {
        await db.Product.decrement("stock_quantity", {
          by: item.quantity,
          where: { id: item.product_id },
          transaction,
        });
      }
      await db.Product.increment("sold_count", {
        by: item.quantity,
        where: { id: item.product_id },
        transaction,
      });
    }

    // 6.5. Xử lý Coupon & Loyalty Points
    if (pointsUsed > 0) {
      await db.User.decrement("loyalty_points", {
        by: pointsUsed,
        where: { id: userId },
        transaction
      });
    }
    
    if (couponId) {
      await db.Coupon.increment("used_count", { by: 1, where: { id: couponId }, transaction });
      await db.UserCouponUsage.create({
        user_id: userId,
        coupon_id: couponId,
        order_id: order.id,
        used_at: new Date()
      }, { transaction });
    }

    // 7. Commit transaction
    await transaction.commit();

    // 8. Xóa giỏ hàng nếu là đặt từ giỏ hàng
    if (isCartCheckout) {
      await cartService.clearCart(userId);
    }

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Lấy danh sách đơn hàng của user
const getUserOrders = async (userId, { page = 1, limit = 10, status }) => {
  const where = { user_id: userId };
  if (status) where.status = status;

  const offset = (page - 1) * limit;
  const { count, rows } = await db.Order.findAndCountAll({
    where,
    include: [{ model: db.OrderItem, as: "items" }],
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

// Lấy chi tiết 1 đơn hàng
const getOrderDetail = async (userId, orderId) => {
  const order = await db.Order.findOne({
    where: { id: orderId, user_id: userId },
    include: [
      { model: db.OrderItem, as: "items" },
      {
        model: db.OrderStatusLog,
        as: "statusLogs",
        order: [["created_at", "ASC"]],
      },
    ],
  });

  if (!order) throw new Error("Không tìm thấy đơn hàng");
  return order;
};

// Yêu cầu hủy đơn hàng
const cancelOrder = async (userId, orderId, reason) => {
  const order = await db.Order.findOne({
    where: { id: orderId, user_id: userId },
  });
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED", "PREPARING"];
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    throw new Error("Đơn hàng không thể hủy ở trạng thái hiện tại");
  }

  const minutesSinceOrder =
    (Date.now() - new Date(order.created_at)) / 1000 / 60;
  
  if (minutesSinceOrder > 30) {
    throw new Error("Đã quá 30 phút kể từ lúc đặt hàng, bạn không thể hủy đơn.");
  }

  const isPreparing = order.status === "PREPARING";
  let newStatus;
  let logNote;

  if (isPreparing) {
    newStatus = "CANCEL_REQUESTED";
    logNote = `Người dùng gửi yêu cầu hủy đơn: ${reason || "Không có lý do"}`;
  } else {
    newStatus = "CANCELLED";
    logNote = `Đơn hàng bị hủy bởi người dùng: ${reason || "Không có lý do"}`;
  }

  const fromStatus = order.status;
  await order.update({ status: newStatus, cancelled_at: new Date() });

  await db.OrderStatusLog.create({
    order_id: orderId,
    from_status: fromStatus,
    to_status: newStatus,
    changed_by: userId,
    note: logNote,
  });

  return { order, newStatus };
};

// Xác nhận đơn hàng (thủ công cho Admin/Vendor)
const confirmOrder = async (orderId, adminId = null) => {
  const order = await db.Order.findByPk(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  
  if (order.status !== "PENDING") {
    throw new Error("Chỉ đơn hàng PENDING mới có thể xác nhận");
  }

  await order.update({ status: "CONFIRMED", confirmed_at: new Date() });

  await db.OrderStatusLog.create({
    order_id: orderId,
    from_status: "PENDING",
    to_status: "CONFIRMED",
    changed_by: adminId,
    note: "Đơn hàng được xác nhận",
  });

  return order;
};

// Auto-confirm orders > 30 mins
const autoConfirmOrders = async () => {
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  const pendingOrders = await db.Order.findAll({
    where: {
      status: "PENDING",
      created_at: {
        [db.Sequelize.Op.lt]: thirtyMinsAgo
      }
    }
  });

  if (pendingOrders.length === 0) return 0;

  for (const order of pendingOrders) {
    await order.update({ status: "CONFIRMED", confirmed_at: new Date() });
    await db.OrderStatusLog.create({
      order_id: order.id,
      from_status: "PENDING",
      to_status: "CONFIRMED",
      changed_by: null,
      note: "Đơn hàng được xác nhận tự động sau 30 phút",
    });
  }

  return pendingOrders.length;
};

export default { calculateCheckout, createOrder, getUserOrders, getOrderDetail, cancelOrder, confirmOrder, autoConfirmOrders };
