'use client';

import { Button } from '@/components/ui/button';
import { ConversationListItem } from './ConversationListItem';
import type { Conversation } from '@/interfaces';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationsListProps {
  conversations: Conversation[];
  currentUserId: string | null;
  activeId?: string | null;
  isLoading?: boolean;
  onCreateGroup?: () => void;
  emptyHint?: string;
}

export function ConversationsList({
  conversations,
  currentUserId,
  activeId,
  isLoading,
  onCreateGroup,
  emptyHint = 'No conversations yet',
}: ConversationsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-md px-3 py-2"
          >
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-1.5 h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-bg-elevated p-6 text-center">
        <p className="text-body text-text-secondary">{emptyHint}</p>
        {onCreateGroup && (
          <Button
            className="mt-3"
            size="sm"
            onClick={onCreateGroup}
          >
            <Plus className="mr-2 h-4 w-4" />
            Start a group
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((c) => (
        <ConversationListItem
          key={c._id}
          conversation={c}
          currentUserId={currentUserId}
          active={c._id === activeId}
        />
      ))}
    </div>
  );
}
