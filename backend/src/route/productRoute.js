import express from "express";
import productController from "../controllers/productController.js";

const router = express.Router();

router.get("/featured", productController.getFeaturedProducts);
router.get("/newest", productController.getNewestProducts);
router.get("/best-sellers", productController.getBestSellerProducts);
router.get("/most-viewed", productController.getMostViewedProducts);

router.get("/", productController.getProducts);
router.get("/:slug", productController.getProductBySlug);
router.get("/:slug/similar", productController.getSimilarProducts);

export default router;
