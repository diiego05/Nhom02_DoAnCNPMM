import db from "../models/index.js";
import { Op } from "sequelize";

const getMessages = async (userId, partnerId) => {
  return await db.Message.findAll({
    where: {
      [Op.or]: [
        { sender_id: userId, receiver_id: partnerId },
        { sender_id: partnerId, receiver_id: userId }
      ]
    },
    order: [["created_at", "ASC"]]
  });
};

const sendMessage = async (senderId, receiverId, content) => {
  if (!content || !content.trim()) {
    throw new Error("Nội dung tin nhắn không thể bỏ trống");
  }

  // Đảm bảo đối tác (receiver) tồn tại
  const receiverExists = await db.User.findByPk(receiverId);
  if (!receiverExists) {
    throw new Error("Không tìm thấy người nhận tin nhắn");
  }

  return await db.Message.create({
    sender_id: senderId,
    receiver_id: receiverId,
    content
  });
};

export default {
  getMessages,
  sendMessage
};
