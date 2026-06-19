import chatService from "../services/chatService.js";

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;
    const messages = await chatService.getMessages(userId, partnerId);
    return res.status(200).json({ message: "Success", data: messages });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    return res.status(500).json({ error: "Lỗi lấy lịch sử tin nhắn" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    if (!receiverId) {
      return res.status(400).json({ message: "Thiếu ID người nhận" });
    }
    const message = await chatService.sendMessage(senderId, receiverId, content);
    return res.status(201).json({ message: "Gửi tin nhắn thành công", data: message });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return res.status(400).json({ message: error.message || "Lỗi gửi tin nhắn" });
  }
};

export default {
  getMessages,
  sendMessage
};
