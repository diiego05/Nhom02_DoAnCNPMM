import express from "express";
import couponController from "../controllers/couponController.js";
import { optionalVerifyToken } from "../middleware/auth.js"; 

const router = express.Router();

router.get("/valid", optionalVerifyToken, couponController.getValidCoupons);

export default router;
