import express from "express";
import orderController from "../controllers/orderController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

// ⚠️ Route tĩnh trước route động
router.post("/", orderController.createOrder); // Đặt hàng
router.get("/", orderController.getMyOrders); // Lịch sử đơn hàng
router.get("/:orderId", orderController.getOrderDetail); // Chi tiết đơn
router.post("/:orderId/cancel", orderController.cancelOrder); // Hủy đơn
router.post("/:orderId/confirm", orderController.confirmOrder); // Xác nhận đơn (dành cho Admin/Vendor)

export default router;
