import express from "express";
import reviewController from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

// Route này sẽ được mount tại /api/products/:id/reviews
router.get("/", reviewController.getProductReviews);

router.post("/", verifyToken, reviewController.createReview); 
router.put("/", verifyToken, reviewController.updateReview);

export default router;
