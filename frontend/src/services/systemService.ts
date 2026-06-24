import { axiosClient } from "./axiosClient";

export type SystemSettings = {
  earnRate: number;
  redeemRate: number;
};

export const systemService = {
  getPublicSettings: () =>
    axiosClient.get<{ message: string; data: SystemSettings }>("/system/settings/public"),
};
