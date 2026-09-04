/* eslint-disable @next/next/no-img-element */
'use client';

import { navItems } from '@/constants';
import { useSidebar } from '@/hooks';
import { useChatStore } from '@/stores/chat.store';
import { cn } from '@/lib/utils';
import { LogOut, Music2, Users, X } from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  const { open, setOpen, user, handleLogout, pathname } = useSidebar();

  const pendingRequestCount = useChatStore(
    (s) => s.pendingContactRequestCount
  );
  // Subscribe so we re-render on SSE updates.
  const unreadByConversation = useChatStore((s) => s.unreadByConversation);
  const totalUnread = Object.values(unreadByConversation).reduce(
    (sum, n) => sum + n,
    0
  );

  return (
    <>
      {/* Overlay only on mobile/tablet. Backdrop blocks taps and tints the page. */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        // Tabular scroll lock only when the drawer is taller than viewport.
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-sidebar max-w-[85vw] flex-col border-r border-border bg-bg-secondary transition-transform duration-200 ease-out',
          // Drawer on mobile/tablet; sticky rail from lg up.
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link
            href="/library"
            className="flex items-center gap-2"
          >
            <Music2 className="h-6 w-6 text-accent" />
            <span className="text-h3 font-bold tracking-tight">Music</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-bg-highlight hover:text-text-primary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname?.startsWith(href);
            const isChat = href === '/chat';
            const badgeCount = isChat
              ? Math.max(totalUnread, pendingRequestCount)
              : 0;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-colors',
                  isActive
                    ? 'bg-bg-highlight text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
                {isChat && badgeCount > 0 && (
                  <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-black">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Master-only section */}
          {user?.isAdmin === 'master' && (
            <div className="pt-3">
              <div className="mb-1 px-3 text-caption font-semibold uppercase tracking-wider text-text-muted">
                Master
              </div>
              <Link
                href="/admin/users"
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-colors',
                  pathname?.startsWith('/admin/users')
                    ? 'bg-bg-highlight text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <Users className="h-5 w-5" />
                User
              </Link>
            </div>
          )}
        </nav>

        <div className="m-3 mt-0">
          <div className="flex items-center gap-3 rounded-lg bg-bg-elevated p-3">
            {user?.avatarUrl ? (
              <Link href="/profile">
                <img
                  src={user?.avatarUrl}
                  alt="Avatar"
                  className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-body font-semibold text-white"
                />
              </Link>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-body font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() ??
                  user?.email?.[0]?.toUpperCase() ??
                  '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-text-primary">
                {user?.name || 'Guest'}
              </p>
              <p className="truncate text-caption text-text-muted">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-highlight hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
