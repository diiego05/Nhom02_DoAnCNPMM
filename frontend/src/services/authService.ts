import { axiosClient } from "@/services/axiosClient";

export type LoginFormData = {
  email_or_phone: string;
  password: string;
};

export const authService = {
  login: (data: LoginFormData) => axiosClient.post("/auth/login", data),
  logout: () => axiosClient.post("/auth/logout"),
};
