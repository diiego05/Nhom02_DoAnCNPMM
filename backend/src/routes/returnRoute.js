import express from "express";
import returnController from "../controllers/returnController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", returnController.createReturnRequest);
router.get("/", returnController.getMyReturnRequests);
router.get("/:id", returnController.getReturnRequestDetail);

export default router;
