import { axiosClient } from "./axiosClient";

export const managerService = {
  getStats: async () => {
    const response = await axiosClient.get("/manager/stats");
    return response.data.data;
  },
  getPendingProducts: async () => {
    const response = await axiosClient.get("/manager/products/pending");
    return response.data.data;
  },
  getActiveProducts: async () => {
    const response = await axiosClient.get("/manager/products/active");
    return response.data.data;
  },
  updateProductStatus: async (id: number, status: string) => {
    const response = await axiosClient.put(`/manager/products/${id}/status`, { status });
    return response.data.data;
  },
  getDisputes: async () => {
    const response = await axiosClient.get("/manager/disputes");
    return response.data.data;
  },
  resolveDispute: async (id: number, status: string) => {
    const response = await axiosClient.put(`/manager/disputes/${id}/resolve`, { status });
    return response.data.data;
  },
  getVouchers: async () => {
    const response = await axiosClient.get("/manager/vouchers");
    return response.data.data;
  },
  createVoucher: async (payload: {
    code: string;
    discount_type: "PERCENT" | "FIXED";
    discount_value: number;
    max_discount?: number | null;
    min_order_amount: number;
    usage_limit?: number | null;
    start_date: string;
    end_date: string;
  }) => {
    const response = await axiosClient.post("/manager/vouchers", payload);
    return response.data.data;
  },
  deleteVoucher: async (id: number) => {
    const response = await axiosClient.delete(`/manager/vouchers/${id}`);
    return response.data.data;
  },
  getCampaigns: async () => {
    const response = await axiosClient.get("/manager/campaigns");
    return response.data.data;
  },
  createCampaign: async (payload: { title: string; type: string; date: string }) => {
    const response = await axiosClient.post("/manager/campaigns", payload);
    return response.data.data;
  },
  getVendors: async () => {
    const response = await axiosClient.get("/manager/vendors");
    return response.data.data;
  },
  updateVendorStatus: async (id: number, status: string, reason?: string) => {
    const response = await axiosClient.put(`/manager/vendors/${id}/status`, { status, reason });
    return response.data.data;
  },
  getReviews: async () => {
    const response = await axiosClient.get("/manager/reviews");
    return response.data.data;
  },
  deleteReview: async (id: number) => {
    const response = await axiosClient.delete(`/manager/reviews/${id}`);
    return response.data.data;
  },
  getReportOverview: async () => {
    const response = await axiosClient.get("/manager/reports/overview");
    return response.data.data;
  },
};

export default managerService;
