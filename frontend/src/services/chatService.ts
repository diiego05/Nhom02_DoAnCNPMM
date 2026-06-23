import { axiosClient } from "./axiosClient";

export interface ChatPartner {
  type: "shop" | "user";
  id: number;
  name: string;
  avatar: string | null;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  is_read: boolean;
  sent_at: string;
}

export interface ConversationInfo {
  id: number;
  partner: ChatPartner;
  lastMessage: {
    id: number;
    body: string;
    sent_at: string;
    sender_id: number;
    is_read: boolean;
  } | null;
  unreadCount: number;
  updated_at: string;
}

export const chatService = {
  // Lấy tổng số lượng tin nhắn chưa đọc
  getUnreadCount: async () => {
    const response = await axiosClient.get("/chats/unread-count");
    return response.data;
  },
  
  // Lấy lịch sử tin nhắn với đối tác (partnerId)
  getChatHistory: async (partnerId: number | string) => {
    const response = await axiosClient.get(`/chats/messages/${partnerId}`);
    return response.data;
  },
  
  // Gửi tin nhắn đến đối tác (receiverId)
  sendMessage: async (receiverId: number | string, content: string) => {
    const response = await axiosClient.post("/chats/messages", { receiverId, content });
    return response.data;
  },

  // Lấy danh sách cuộc trò chuyện của người dùng hiện tại
  getConversations: async () => {
    const response = await axiosClient.get("/chats/conversations");
    return response.data;
  }
};
