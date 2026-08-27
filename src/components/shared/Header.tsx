"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar.store";

export function Header() {
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const pathname = usePathname();

  // Show a "Search" pill only outside the /search page.
  const showSearch = !pathname?.startsWith("/search");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:justify-end lg:px-8">
      <button
        onClick={toggleSidebar}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-bg-highlight hover:text-text-primary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {showSearch && (
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2 text-caption text-text-secondary transition-colors hover:text-text-primary"
        >
          <Search className="h-4 w-4" />
          Search
        </Link>
      )}
    </header>
  );
}