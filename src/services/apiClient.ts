import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    Accept:         "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      const path = window.location.pathname;
      if (!path.startsWith("/login") && path !== "/") {
        window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
      }
    }

    if (status === 403) {
      console.warn("[apiClient] Forbidden:", error.config?.url);
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "An unexpected network error occurred."
    );
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
