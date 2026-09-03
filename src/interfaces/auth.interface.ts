import type { IApiResponse } from '@/types';
import type { IUser } from './user.interface';

export interface IAuth {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface ILoginBody {
  email: string;
  password: string;
}

export interface IRegisterBody {
  name?: string;
  email: string;
  password: string;
}

export interface ILoginResponse extends IApiResponse<IAuth> {
  data: IAuth;
}

export type IRegisterResponse = IAuth;

export interface IRefreshResponse {
  accessToken: string;
}
