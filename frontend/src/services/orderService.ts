import { Order, CreateOrderPayload, OrderListResponse } from "@/types/order.types";
import { axiosClient } from "./axiosClient";

const orderService = {
  calculateCheckout: async (payload: any) => {
    const response = await axiosClient.post("/orders/calculate", payload);
    return response.data.data;
  },

  createOrder: async (payload: CreateOrderPayload) => {
    const response = await axiosClient.post("/orders", payload);
    return response.data.data as Order;
  },

  getMyOrders: async (status?: string, page = 1, limit = 10) => {
    const params: any = { page, limit };
    if (status && status !== "all") {
      params.status = status;
    }
    const response = await axiosClient.get("/orders", { params });
    return response.data.data as OrderListResponse;
  },

  getOrderDetail: async (id: number) => {
    const response = await axiosClient.get(`/orders/${id}`);
    return response.data.data as Order;
  },

  cancelOrder: async (id: number, reason?: string) => {
    const response = await axiosClient.post(`/orders/${id}/cancel`, { reason });
    return response.data.data as Order;
  },
};

export default orderService;
