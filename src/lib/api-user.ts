import api from "./api";
import type { ApiSuccess } from "@/types/api-response";
import type { User } from "@/interfaces/user.interface";

export const getMe = () => api.get<ApiSuccess<User>>("/users/me");

export const updateMe = (body: {
  name?: string;
  birthdate?: string | null;
  gender?: "male" | "female" | "other" | null;
}) => api.patch<ApiSuccess<User>>("/users/me", body);

export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<ApiSuccess<{ avatarUrl: string }>>("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteAvatar = () =>
  api.delete<ApiSuccess<{ avatarUrl: null }>>("/users/me/avatar");
