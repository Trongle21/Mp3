"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-end gap-4 bg-bg-primary/80 px-8 py-4 backdrop-blur">
      <Link
        href="/search"
        className="flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2 text-caption text-text-secondary transition-colors hover:text-text-primary"
      >
        <Search className="h-4 w-4" />
        Search
      </Link>
    </header>
  );
}
