'use client';

import { TabSwitcher } from './TabSwitcher';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

interface ChatSidebarProps<T extends string> {
  tabs: ReadonlyArray<{ value: T; label: string; badge?: number }>;
  activeTab: T;
  onTabChange: (next: T) => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  onCreateGroup?: () => void;
  createLabel?: string;
  children: ReactNode;
}

export function ChatSidebar<T extends string>(props: ChatSidebarProps<T>) {
  const {
    tabs,
    activeTab,
    onTabChange,
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Search',
    onCreateGroup,
    createLabel = 'New group',
    children,
  } = props;

  return (
    <aside className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-h2 sm:text-h1">Chat</h1>
        {onCreateGroup && (
          <Button
            size="sm"
            onClick={onCreateGroup}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {createLabel}
          </Button>
        )}
      </div>

      <TabSwitcher
        options={tabs}
        value={activeTab}
        onChange={onTabChange}
      />

      <input
        type="search"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={e => onSearchChange(e.target.value)}
        className="h-10 rounded-md border border-border bg-bg-elevated px-3 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />

      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}
