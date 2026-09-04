'use client';

import { useSidebarStore } from '@/stores/sidebar.store';
import { Menu } from 'lucide-react';

export function Header() {
  const toggleSidebar = useSidebarStore(s => s.toggle);

  // Show a "Search" pill only outside the /search page.

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:justify-end lg:px-8">
      <button
        onClick={toggleSidebar}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-bg-highlight hover:text-text-primary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
