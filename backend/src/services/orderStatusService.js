import db from "../models/index.js";

const updateOrderStatus = async (orderId, newStatus, userId, note = "") => {
  const transaction = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(orderId, { transaction });
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const oldStatus = order.status;
    if (oldStatus === newStatus) {
      throw new Error("Trạng thái hiện tại đã là " + newStatus);
    }

    const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED", "CANCELLED", "RETURNED"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Trạng thái không hợp lệ");
    }

    // Nếu hủy đơn hàng, phục hồi tồn kho
    if (newStatus === "CANCELLED" && oldStatus !== "CANCELLED") {
      const items = await db.OrderItem.findAll({ where: { order_id: orderId }, transaction });
      for (const item of items) {
        if (item.product_variant_id) {
          await db.ProductVariant.increment("stock_quantity", { by: item.quantity, where: { id: item.product_variant_id }, transaction });
        } else {
          await db.Product.increment("stock_quantity", { by: item.quantity, where: { id: item.product_id }, transaction });
        }
        await db.Product.decrement("sold_count", { by: item.quantity, where: { id: item.product_id }, transaction });
      }
      
      // Hoàn lại điểm nếu dùng
      if (order.points_used > 0) {
        const user = await db.User.findByPk(order.user_id, { transaction });
        if (user) {
          await user.increment("loyalty_points", { by: order.points_used, transaction });
        }
      }
    }

    // Nếu giao thành công, thưởng điểm (1%)
    if (newStatus === "DELIVERED" && oldStatus !== "DELIVERED") {
      order.payment_status = "PAID";
      const pointsEarned = Math.floor(order.total_amount * 0.01);
      const user = await db.User.findByPk(order.user_id, { transaction });
      if (user) {
        await user.increment("loyalty_points", { by: pointsEarned, transaction });
      }
    }

    order.status = newStatus;
    await order.save({ transaction });

    await db.OrderStatusLog.create(
      {
        order_id: orderId,
        from_status: oldStatus,
        to_status: newStatus,
        changed_by: userId || null,
        note: note || `Cập nhật trạng thái thành ${newStatus}`,
      },
      { transaction }
    );

    await transaction.commit();
    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default { updateOrderStatus };
