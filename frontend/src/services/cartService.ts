import { Cart, AddToCartPayload, UpdateCartItemPayload } from "@/types/cart.types";
import { axiosClient } from "./axiosClient";

const cartService = {
  getCart: async () => {
    const response = await axiosClient.get("/cart");
    return response.data.data as Cart;
  },

  addItem: async (payload: AddToCartPayload) => {
    const response = await axiosClient.post("/cart/items", payload);
    return response.data.data; // có thể trả về thông báo hoặc CartItem mới
  },

  updateItem: async (itemId: number, payload: UpdateCartItemPayload) => {
    const response = await axiosClient.put(`/cart/items/${itemId}`, payload);
    return response.data.data;
  },

  removeItem: async (itemId: number) => {
    const response = await axiosClient.delete(`/cart/items/${itemId}`);
    return response.data.message;
  },

  clearCart: async () => {
    const response = await axiosClient.delete("/cart");
    return response.data.message;
  },
};

export default cartService;
