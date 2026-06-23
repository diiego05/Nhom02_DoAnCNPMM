import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import orderService from "@/services/orderService";
import { CreateOrderPayload } from "@/types/order.types";
import { useAppDispatch } from "@/stores/hooks";
import { clearCartCount } from "@/stores/slices/cartSlice";

export const useMyOrders = (status?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["orders", status, page, limit],
    queryFn: () => orderService.getMyOrders(status, page, limit),
  });
};

export const useOrderDetail = (id: number) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderDetail(id),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.createOrder(payload),
    onSuccess: () => {
      // Refresh order list and cart
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      // Reset badge
      dispatch(clearCartCount());
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => orderService.cancelOrder(id, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useCalculateCheckout = () => {
  return useMutation({
    mutationFn: (payload: any) => orderService.calculateCheckout(payload),
  });
};

export const useRetryPayment = () => {
  return useMutation({
    mutationFn: (orderId: number) => orderService.retryPayment(orderId),
  });
};
