import axios from "axios";
import type { AuthUser, LoginCredentials } from "@/store/authStore";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export interface LoginResponse {
  token: string;
  user: AuthUser & { isNidVerified: boolean };
}

export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${baseURL}/login`, credentials, {
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    withCredentials: false,
  });
  return data;
}

export async function logoutRequest(token: string): Promise<void> {
  await axios.post(
    `${baseURL}/logout`,
    {},
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
  );
}

export async function meRequest(token: string): Promise<LoginResponse["user"]> {
  const { data } = await axios.get<{ user: LoginResponse["user"] }>(`${baseURL}/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  return data.user;
}
