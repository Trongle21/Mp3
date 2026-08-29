import type { ApiSuccess } from "@/types/api-response";
import type { User } from "@/interfaces/user.interface";
import { ApiClient } from "@/api";

export const getAllUsers = () => ApiClient.get<ApiSuccess<User[]>>("/users");

export const updateUserRole = (
  userId: string,
  body: { isAdmin: "normal" | null },
) => ApiClient.patch<ApiSuccess<User>>(`/users/${userId}/role`, body);

export const updateUser = (
  userId: string,
  body: {
    name?: string;
    birthdate?: string | null;
    gender?: "male" | "female" | "other" | null;
  },
) => ApiClient.patch<ApiSuccess<User>>(`/users/${userId}`, body);

export const deleteUser = (userId: string) =>
  ApiClient.delete<ApiSuccess<{ _id: string }>>(`/users/${userId}`);
