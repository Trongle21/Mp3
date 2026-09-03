export interface IUser {
  _id: string;
  email: string;
  name: string;
  isAdmin: 'master' | 'normal' | null;
  avatarUrl: string | null;
  birthdate: string | null;
  gender: 'male' | 'female' | 'other' | null;
  createdAt: string;
}

export interface IUserListResponse {
  data: IUser[];
}

export interface IUserResponse {
  data: IUser;
}

export interface IUpdateRoleBody {
  isAdmin: 'master' | 'normal';
}

export interface IUpdateUserBody {
  name?: string;
  birthdate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}

export interface IUpdateMeBody {
  name?: string;
  birthdate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}
