import { create } from "zustand";
import * as authApi from "@/lib/api-auth";
import type { User } from "@/interfaces/user.interface";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
  setUser: (user: User) => void;
}

function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    persistTokens(data.data.accessToken, data.data.refreshToken);
    set({ user: data.data.user, accessToken: data.data.accessToken, isAuthenticated: true });
  },

  register: async (email, password, name) => {
    const { data } = await authApi.register({ email, password, name });
    persistTokens(data.data.accessToken, data.data.refreshToken);
    set({ user: data.data.user, accessToken: data.data.accessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  // Called once on app mount: restore session from a stored access token.
  loadFromStorage: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      set({ isInitializing: false });
      return;
    }
    try {
      const { data } = await authApi.getMe();
      set({ user: data.data, accessToken: token, isAuthenticated: true, isInitializing: false });
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false });
    }
  },
}));
