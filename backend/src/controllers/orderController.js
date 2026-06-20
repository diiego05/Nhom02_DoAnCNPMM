import orderService from "../services/orderService.js";

const createOrder = async (req, res) => {
  try {
    const {
      paymentMethod,
      addressId,
      platformCouponCode,
      shopCoupons,
      items,
      usePoints,
      is_cart_checkout,
      note,
    } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: "Thiếu thông tin giao hàng (addressId)" });
    }

    const order = await orderService.createOrder(req.user.id, {
      paymentMethod,
      addressId,
      platformCouponCode,
      shopCoupons,
      items,
      usePoints,
      is_cart_checkout,
      note,
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
    const result = await orderService.getUserOrders(req.user.id, req.query);
    return res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const calculateCheckout = async (req, res) => {
  try {
    const { items, platformCouponCode, shopCoupons, usePoints } = req.body;
    const result = await orderService.calculateCheckout(req.user.id, {
      items,
      platformCouponCode,
      shopCoupons,
      usePoints,
    });
    return res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params; // this is shop_order_id
    
    let role = "user";
    if (req.user.role && req.user.role.role_name) {
       role = req.user.role.role_name;
    }
    
    const order = await orderService.updateOrderStatus(orderId, req.user.id, status, role);
    return res.status(200).json({ message: "Cập nhật trạng thái thành công", data: order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderService.getOrderDetail(id, req.user.id);
    return res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await orderService.cancelOrder(id, req.user.id, reason);
    return res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export default {
  createOrder,
  getMyOrders,
  calculateCheckout,
  updateOrderStatus,
  getOrderDetail,
  cancelOrder,
};
