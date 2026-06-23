import express from "express";
import chatController from "../controllers/chatController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

router.get("/conversations", chatController.getConversations);
router.get("/unread-count", chatController.getUnreadCount);
router.get("/messages/:partnerId", chatController.getMessages);
router.post("/messages", chatController.sendMessage);


export default router;
