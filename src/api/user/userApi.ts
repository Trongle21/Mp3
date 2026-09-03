import type {
  IUpdateMeBody,
  IUpdateRoleBody,
  IUpdateUserBody,
  IUserListResponse,
  IUserResponse,
} from '@/interfaces';

import { AxiosService } from '../axiosService';
import { USER_ENDPOINTS } from './user.endpoints';

export const userApi = {
  getAll: () => AxiosService.get<IUserListResponse>(USER_ENDPOINTS.BASE),

  updateRole: (userId: string, body: IUpdateRoleBody) =>
    AxiosService.patch<IUserResponse>(USER_ENDPOINTS.ROLE(userId), body),

  update: (userId: string, body: IUpdateUserBody) =>
    AxiosService.patch<IUserResponse>(USER_ENDPOINTS.DETAIL(userId), body),

  delete: (userId: string) =>
    AxiosService.delete<{ _id: string }>(USER_ENDPOINTS.DETAIL(userId)),

  getMe: () => AxiosService.get<IUserResponse>(USER_ENDPOINTS.ME),

  updateMe: (body: IUpdateMeBody) =>
    AxiosService.patch<IUserResponse>(USER_ENDPOINTS.ME, body),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return AxiosService.post<{ avatarUrl: string }>(
      USER_ENDPOINTS.AVATAR,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  deleteAvatar: () =>
    AxiosService.delete<{ avatarUrl: null }>(USER_ENDPOINTS.AVATAR),
};
