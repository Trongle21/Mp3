import { userApi } from '@/api';
import type { IAuth, IRegisterResponse } from '@/interfaces';
import type { IUser } from '@/interfaces/user.interface';
import { create } from 'zustand';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  login: (data: IAuth) => Promise<void>;
  register: (data: IRegisterResponse) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
  setUser: (user: IUser) => void;
}

function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  login: async (data: IAuth) => {
    persistTokens(data.accessToken, data.refreshToken);
    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true,
    });
  },

  register: async (data: IRegisterResponse) => {
    persistTokens(data.accessToken, data.refreshToken);
    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setUser: user => set({ user }),

  // Called once on app mount: restore session from a stored access token.
  loadFromStorage: async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    if (!token) {
      set({ isInitializing: false });
      return;
    }
    try {
      const { data } = await userApi.getMe();
      set({
        user: data.data,
        accessToken: token,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },
}));
