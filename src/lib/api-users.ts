import api from "./api";
import type { ApiSuccess } from "@/types/api-response";
import type { User } from "@/interfaces/user.interface";

export const getAllUsers = () => api.get<ApiSuccess<User[]>>("/users");

export const updateUserRole = (
  userId: string,
  body: { isAdmin: "normal" | "master" | null }
) => api.patch<ApiSuccess<User>>(`/users/${userId}/role`, body);
