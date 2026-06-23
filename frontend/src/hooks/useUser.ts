import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";

export const useProfile = (options?: any) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile().then(res => res.data.data),
    ...options
  });
};

export const useFavorites = (options?: any) => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => userService.getFavorites().then(res => res.data.data),
    ...options
  });
};

export const useViewedProducts = (options?: any) => {
  return useQuery({
    queryKey: ["viewed-products"],
    queryFn: () => userService.getViewedProducts().then(res => res.data.data),
    ...options
  });
};
