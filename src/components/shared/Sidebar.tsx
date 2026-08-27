"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, ListMusic, Search, LogOut, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/library", label: "Library", icon: Library },
  { href: "/groups", label: "Groups", icon: ListMusic },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-sidebar flex-col border-r border-border bg-bg-secondary">
      <div className="flex items-center gap-2 px-6 py-6">
        <Music2 className="h-6 w-6 text-accent" />
        <span className="text-h3 font-bold tracking-tight">Music</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-body font-medium transition-colors",
                isActive
                  ? "bg-bg-highlight text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 mt-0">
        <div className="flex items-center gap-3 rounded-lg bg-bg-elevated p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-body font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?"}
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-highlight hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
