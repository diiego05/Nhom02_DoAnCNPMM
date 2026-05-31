import { useQuery } from "@tanstack/react-query";
import couponService from "@/services/couponService";

export const useValidCoupons = () => {
  return useQuery({
    queryKey: ["valid-coupons"],
    queryFn: () => couponService.getValidCoupons(),
  });
};
