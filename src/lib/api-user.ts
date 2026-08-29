import { ApiClient } from "../api/axiosInstance";

import type { ApiSuccess } from "@/types/api-response";
import type { User } from "@/interfaces/user.interface";

export const getMe = () => ApiClient.get<ApiSuccess<User>>("/users/me");

export const updateMe = (body: {
  name?: string;
  birthdate?: string | null;
  gender?: "male" | "female" | "other" | null;
}) => ApiClient.patch<ApiSuccess<User>>("/users/me", body);

export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return ApiClient.post<ApiSuccess<{ avatarUrl: string }>>(
    "/users/me/avatar",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
};

export const deleteAvatar = () =>
  ApiClient.delete<ApiSuccess<{ avatarUrl: null }>>("/users/me/avatar");
