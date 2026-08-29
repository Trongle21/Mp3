import type { ApiSuccess } from "@/types/api-response";
import type { User } from "@/interfaces/user.interface";
import { ApiClient } from "@/api";

export interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const register = (body: {
  email: string;
  password: string;
  name?: string;
}) => ApiClient.post<ApiSuccess<AuthPayload>>("/auth/register", body);

export const login = (body: { email: string; password: string }) =>
  ApiClient.post<ApiSuccess<AuthPayload>>("/auth/login", body);

export const refresh = (refreshToken: string) =>
  ApiClient.post<ApiSuccess<{ accessToken: string }>>("/auth/refresh", {
    refreshToken,
  });

export const getMe = () => ApiClient.get<ApiSuccess<User>>("/auth/me");
