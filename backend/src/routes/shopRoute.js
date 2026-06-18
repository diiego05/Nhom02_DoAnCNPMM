import express from "express";
import shopController from "../controllers/shopController.js";
import { verifyToken, isVendor } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Routes công khai (Public)
router.get("/:id", shopController.getShopProfile);
router.get("/:id/vouchers", shopController.getShopVouchers);

// Các routes cần đăng nhập (Protected)
router.use(verifyToken);

// Chỉ đăng ký mới shop là cho phép User thường chưa có vai trò Vendor
router.post("/", shopController.registerShop);

// Các routes quản trị shop chỉ dành riêng cho Vendor
router.use(isVendor);

router.get("/my-shop/info", shopController.getMyShop);
router.put("/my-shop/info", shopController.updateMyShop);
router.get("/my-shop/statistics", shopController.getShopStatistics);
router.get("/my-shop/orders", shopController.getShopOrders);
router.get("/my-shop/reviews", shopController.getShopReviews);

// Quản lý sản phẩm của shop
router.post("/my-shop/products", shopController.createProduct);
router.put("/my-shop/products/:id", shopController.updateProduct);
router.delete("/my-shop/products/:id", shopController.deleteProduct);

// Quản lý khuyến mãi của shop
router.post("/my-shop/vouchers", shopController.createShopVoucher);
router.delete("/my-shop/vouchers/:id", shopController.deleteShopVoucher);

// Quản lý tài chính & Rút tiền của shop
router.post("/my-shop/withdraw", shopController.requestWithdrawal);
router.get("/my-shop/withdrawals", shopController.getWithdrawals);

// Tải ảnh lên từ thiết bị
router.post("/my-shop/upload", upload.single("image"), shopController.uploadImage);

export default router;
