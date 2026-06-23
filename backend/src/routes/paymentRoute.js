import express from "express";
import paymentController from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/vnpay_return", paymentController.vnpayReturn);
router.get("/vnpay_ipn", paymentController.vnpayIpn);
router.post("/vnpay_retry", verifyToken, paymentController.vnpayRetry);

export default router;
