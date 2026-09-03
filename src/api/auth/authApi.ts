import type {
  ILoginBody,
  ILoginResponse,
  IRefreshResponse,
  IRegisterBody,
  IRegisterResponse,
} from '@/interfaces';

import { AxiosService } from '../axiosService';
import { AUTH_ENDPOINTS } from './auth.endpoints';

export const authApi = {
  register: (body: IRegisterBody) =>
    AxiosService.post<IRegisterResponse, IRegisterBody>(
      AUTH_ENDPOINTS.REGISTER,
      body
    ),

  login: (body: ILoginBody) =>
    AxiosService.post<ILoginResponse>(AUTH_ENDPOINTS.LOGIN, body),

  refresh: (refreshToken: string) =>
    AxiosService.post<IRefreshResponse>(AUTH_ENDPOINTS.REFRESH, {
      refreshToken,
    }),
};
