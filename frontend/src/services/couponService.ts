import { axiosClient } from "./axiosClient";

const couponService = {
  getValidCoupons: async () => {
    const response = await axiosClient.get("/coupons/valid");
    return response.data.data;
  },
};

export default couponService;
