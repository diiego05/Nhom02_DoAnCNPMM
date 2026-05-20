import db from "../models/index.js";
import cartService from "./cartService.js";

// Tạo mã đơn hàng duy nhất
const generateOrderCode = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${random}`;
};

// Tạo đơn hàng từ giỏ hàng
const createOrder = async (
  userId,
  {
    paymentMethod = "COD",
    shippingAddress,
    recipientName,
    recipientPhone,
    note,
  },
) => {
  // 1. Lấy giỏ hàng
  const cartData = await cartService.getCartByUserId(userId);
  if (!cartData.items || cartData.items.length === 0) {
    throw new Error("Giỏ hàng trống, không thể đặt hàng");
  }

  // 2. Validate tồn kho lần cuối
  for (const item of cartData.items) {
    const stock = item.variant
      ? item.variant.stock_quantity
      : item.product?.stock_quantity || 0;
    if (item.quantity > stock) {
      throw new Error(
        `Sản phẩm "${item.product?.name}" chỉ còn ${stock} trong kho`,
      );
    }
  }

  // 3. Tính toán giá
  const subtotal = cartData.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unit_price),
    0,
  );
  const shippingFee = subtotal >= 500000 ? 0 : 30000; // Miễn ship đơn >= 500k
  const totalAmount = subtotal + shippingFee; // Tổng tiền

  // 4. Tạo đơn hàng (dùng Transaction để đảm bảo toàn vẹn dữ liệu)
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
        discount_amount: 0,
        total_amount: totalAmount,
        note: note || null,
      },
      { transaction },
    );

    // 5. Tạo order_items từ cart_items (snapshot)
    const orderItems = cartData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      product_name: item.product?.name || "Sản phẩm",
      variant_color: item.variant?.color || null,
      variant_size: item.variant?.size || null,
      product_image_url: item.product?.images?.[0]?.image_url || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * Number(item.unit_price),
    }));
    await db.OrderItem.bulkCreate(orderItems, { transaction });

    // 6. Ghi log trạng thái đầu tiên
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

    // 7. Trừ tồn kho
    for (const item of cartData.items) {
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
      // Tăng sold_count
      await db.Product.increment("sold_count", {
        by: item.quantity,
        where: { id: item.product_id },
        transaction,
      });
    }

    // 8. Commit transaction
    await transaction.commit();

    // 9. Xóa giỏ hàng sau khi đặt thành công
    await cartService.clearCart(userId);

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

  // Đặt hàng > 30 phút và đang ở trạng thái PREPARING → gửi yêu cầu hủy
  const minutesSinceOrder =
    (Date.now() - new Date(order.created_at)) / 1000 / 60;
  const isPreparing = order.status === "PREPARING";
  const isOverDeadline = minutesSinceOrder > 30;

  let newStatus;
  let logNote;

  if (isPreparing || isOverDeadline) {
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

export default { createOrder, getUserOrders, getOrderDetail, cancelOrder };
