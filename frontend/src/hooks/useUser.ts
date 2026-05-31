import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile().then(res => res.data.data),
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => userService.getFavorites().then(res => res.data.data),
  });
};

export const useViewedProducts = () => {
  return useQuery({
    queryKey: ["viewed-products"],
    queryFn: () => userService.getViewedProducts().then(res => res.data.data),
  });
};
