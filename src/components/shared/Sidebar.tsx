"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Library,
  ListMusic,
  Search,
  LogOut,
  Music2,
  X,
  User,
  Shield,
  Upload,
  FolderEdit,
  Users,
  Disc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/sidebar.store";

const navItems = [
  { href: "/library", label: "Library", icon: Library },
  { href: "/albums", label: "Albums", icon: Disc },
  { href: "/groups", label: "Groups", icon: ListMusic },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const open = useSidebarStore((s) => s.open);
  const setOpen = useSidebarStore((s) => s.setOpen);

  // Close the drawer automatically on route change so it doesn't stay open
  // when users tap a link. Desktop doesn't care because the drawer is hidden.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // Lock body scroll while the drawer is open on mobile.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay only on mobile/tablet. Backdrop blocks taps and tints the page. */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        // Tabular scroll lock only when the drawer is taller than viewport.
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-sidebar max-w-[85vw] flex-col border-r border-border bg-bg-secondary transition-transform duration-200 ease-out",
          // Drawer on mobile/tablet; sticky rail from lg up.
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/library" className="flex items-center gap-2">
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
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-colors",
                  isActive
                    ? "bg-bg-highlight text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}

          {/* Profile link */}
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-colors",
              pathname?.startsWith("/profile")
                ? "bg-bg-highlight text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <User className="h-5 w-5" />
            Profile
          </Link>

          {/* Master-only section */}
          {user?.isAdmin === "master" && (
            <div className="pt-3">
              <div className="mb-1 px-3 text-caption font-semibold uppercase tracking-wider text-text-muted">
                Master
              </div>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-body font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                <Users className="h-5 w-5" />
                User
              </Link>
            </div>
          )}
        </nav>

        <div className="m-3 mt-0">
          <div className="flex items-center gap-3 rounded-lg bg-bg-elevated p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-body font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() ??
                user?.email?.[0]?.toUpperCase() ??
                "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-text-primary">
                {user?.name || "Guest"}
              </p>
              <p className="truncate text-caption text-text-muted">
                {user?.email}
              </p>
            </div>
            <button
              onClick={logout}
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
