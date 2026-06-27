import express from "express";
import aiChatController from "../controllers/aiChatController.js";

const router = express.Router();

// Route công khai phục vụ Chatbox AI của Khách hàng
router.post("/chat/ai", aiChatController.chatWithAI);

export default router;
