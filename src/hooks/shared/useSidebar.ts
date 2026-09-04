import { useAuth } from '@/hooks/useAuth';
import { useSidebarStore } from '@/stores/sidebar.store';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export const useSidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const open = useSidebarStore(s => s.open);
  const setOpen = useSidebarStore(s => s.setOpen);

  const router = useRouter();

  // Close the drawer automatically on route change so it doesn't stay open
  // when users tap a link. Desktop doesn't care because the drawer is hidden.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // Lock body scroll while the drawer is open on mobile.
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = useCallback(async () => {
    await router.push('/login');
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    pathname,
    open,
    setOpen,
    user,
    handleLogout,
  };
};
