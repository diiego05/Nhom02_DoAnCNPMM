import express from "express";
import orderController from "../controllers/orderController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

router.post("/calculate", orderController.calculateCheckout); // Tính toán đơn hàng
router.post("/", orderController.createOrder); // Đặt hàng
router.get("/", orderController.getMyOrders); // Lịch sử đơn hàng
router.get("/shipper", orderController.getShipperOrders); // Shipper orders
router.get("/:id", orderController.getOrderDetail); // Chi tiết đơn hàng
router.post("/:id/cancel", orderController.cancelOrder); // Hủy đơn hàng
router.patch("/bulk-status", orderController.bulkUpdateOrderStatus); // Cập nhật trạng thái hàng loạt
router.patch("/:orderId/status", orderController.updateOrderStatus); // Cập nhật trạng thái

export default router;
