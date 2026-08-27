import api from "./api";
import type { ApiSuccess } from "@/types/api-response";
import type { User } from "@/interfaces/user.interface";

export const getAllUsers = () => api.get<ApiSuccess<User[]>>("/users");

export const updateUserRole = (
  userId: string,
  body: { isAdmin: "normal" | null }
) => api.patch<ApiSuccess<User>>(`/users/${userId}/role`, body);

export const updateUser = (
  userId: string,
  body: { name?: string; birthdate?: string | null; gender?: "male" | "female" | "other" | null }
) => api.patch<ApiSuccess<User>>(`/users/${userId}`, body);

export const deleteUser = (userId: string) =>
  api.delete<ApiSuccess<{ _id: string }>>(`/users/${userId}`);
