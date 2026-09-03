import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isInitializing = useAuthStore(s => s.isInitializing);
  const login = useAuthStore(s => s.login);
  const register = useAuthStore(s => s.register);
  const logout = useAuthStore(s => s.logout);
  const setUser = useAuthStore(s => s.setUser);

  return {
    user,
    isAuthenticated,
    isInitializing,
    login,
    register,
    logout,
    setUser,
  };
}
