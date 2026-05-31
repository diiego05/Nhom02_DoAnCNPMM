import orderService from "../services/orderService.js";
import orderStatusService from "../services/orderStatusService.js";

const createOrder = async (req, res) => {
  try {
    const {
      paymentMethod,
      shippingAddress,
      recipientName,
      recipientPhone,
      note,
      items,
      coupon_code,
      use_points,
      is_cart_checkout
    } = req.body;

    if (!shippingAddress || !recipientName || !recipientPhone) {
      return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
    }

    const order = await orderService.createOrder(req.user.id, {
      paymentMethod,
      shippingAddress,
      recipientName,
      recipientPhone,
      note,
      items,
      couponCode: coupon_code,
      usePoints: use_points,
      isCartCheckout: is_cart_checkout
    });

    return res
      .status(201)
      .json({ message: "Đặt hàng thành công", data: order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    console.log(req.query);
    const result = await orderService.getUserOrders(req.user.id, req.query);
    return res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await orderService.getOrderDetail(
      req.user.id,
      req.params.orderId,
    );
    return res.status(200).json({ message: "Success", data: order });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await orderService.cancelOrder(
      req.user.id,
      req.params.orderId,
      reason,
    );
    return res
      .status(200)
      .json({ message: "Yêu cầu hủy đơn thành công", data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const confirmOrder = async (req, res) => {
  try {
    const order = await orderService.confirmOrder(req.params.orderId, req.user?.id);
    return res.status(200).json({ message: "Xác nhận đơn hàng thành công", data: order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const calculateCheckout = async (req, res) => {
  try {
    const { items, couponCode, usePoints } = req.body;
    const result = await orderService.calculateCheckout(req.user.id, {
      items,
      couponCode,
      usePoints,
    });
    return res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const { orderId } = req.params;
    const order = await orderStatusService.updateOrderStatus(orderId, status, req.user?.id, note);
    return res.status(200).json({ message: "Cập nhật trạng thái thành công", data: order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export default { createOrder, getMyOrders, getOrderDetail, cancelOrder, confirmOrder, calculateCheckout, updateOrderStatus };
