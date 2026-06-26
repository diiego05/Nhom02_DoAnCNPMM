import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import managerService from "@/services/managerService";

export const useManagerStats = () => {
  return useQuery({
    queryKey: ["manager", "stats"],
    queryFn: managerService.getStats,
  });
};

export const usePendingProducts = () => {
  return useQuery({
    queryKey: ["manager", "products", "pending"],
    queryFn: managerService.getPendingProducts,
  });
};

export const useActiveProducts = () => {
  return useQuery({
    queryKey: ["manager", "products", "active"],
    queryFn: managerService.getActiveProducts,
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      managerService.updateProductStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager", "products", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["manager", "products", "active"] });
      queryClient.invalidateQueries({ queryKey: ["manager", "stats"] });
    },
  });
};

export const useDisputes = () => {
  return useQuery({
    queryKey: ["manager", "disputes"],
    queryFn: () => managerService.getReturnRequests(1, 100, "REJECTED"),
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approved, resolveNote }: { id: number; approved: boolean, resolveNote: string }) =>
      managerService.resolveReturnRequest(id, approved, resolveNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["manager", "stats"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Lỗi khi xử lý khiếu nại");
    },
  });
};

export const useVouchers = () => {
  return useQuery({
    queryKey: ["manager", "vouchers"],
    queryFn: managerService.getVouchers,
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      code: string;
      discount_type: "PERCENT" | "FIXED";
      discount_value: number;
      max_discount?: number | null;
      min_order_amount: number;
      usage_limit?: number | null;
      start_date: string;
      end_date: string;
    }) => managerService.createVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["manager", "stats"] });
    },
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => managerService.deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["manager", "stats"] });
    },
  });
};

export const useCampaigns = () => {
  return useQuery({
    queryKey: ["manager", "campaigns"],
    queryFn: managerService.getCampaigns,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; type: string; date: string }) =>
      managerService.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager", "campaigns"] });
    },
  });
};

export const useVendors = () => {
  return useQuery({
    queryKey: ["manager", "vendors"],
    queryFn: managerService.getVendors,
  });
};

export const useUpdateVendorStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: string; reason?: string }) =>
      managerService.updateVendorStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager", "vendors"] });
      queryClient.invalidateQueries({ queryKey: ["manager", "stats"] });
    },
  });
};
