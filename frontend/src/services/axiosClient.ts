import axios from "axios";

import { store } from "@/stores/store";

import { logout, setToken } from "@/stores/slices/authSlice";

export const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshTokenRequest: Promise<string> | null = null;

const refreshToken = async () => {
  const response = await publicAxios.post("/auth/refresh");

  if (response.data.data) {
    const { accessToken } = response.data.data;

    store.dispatch(
      setToken({
        accessToken,
      }),
    );

    return accessToken;
  }

  throw new Error("Refresh token failed");
};

axiosClient.interceptors.request.use((config) => {
  const accessToken = store.getState().auth.accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // tránh loop vô hạn
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const isExpiredToken =
      error.response?.status === 401 &&
      error.response?.data?.message === "accessToken jwt expired";

    if (isExpiredToken) {
      originalRequest._retry = true;

      try {
        refreshTokenRequest = refreshTokenRequest || refreshToken();

        const accessToken = await refreshTokenRequest;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return axiosClient(originalRequest);
      } catch (error) {
        await publicAxios.post("/auth/logout").catch(() => {});
        store.dispatch(logout());

        return Promise.reject(error);
      } finally {
        refreshTokenRequest = null;
      }
    }

    return Promise.reject(error);
  },
);
