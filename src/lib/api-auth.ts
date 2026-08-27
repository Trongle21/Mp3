import api from "./api";
import type { ApiSuccess } from "@/types/api-response";
import type { User } from "@/interfaces/user.interface";

export interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const register = (body: { email: string; password: string; name?: string }) =>
  api.post<ApiSuccess<AuthPayload>>("/auth/register", body);

export const login = (body: { email: string; password: string }) =>
  api.post<ApiSuccess<AuthPayload>>("/auth/login", body);

export const refresh = (refreshToken: string) =>
  api.post<ApiSuccess<{ accessToken: string }>>("/auth/refresh", { refreshToken });

export const getMe = () => api.get<ApiSuccess<User>>("/auth/me");
