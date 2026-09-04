'use client';

import { Avatar } from './Avatar';
import type { Conversation, UserBasic } from '@/interfaces';
import { useChatStore } from '@/stores/chat.store';
import { getConversationAvatarUrl, getConversationDisplayName, getDirectConversationPeer } from '@/lib/chat-conversation';
import { formatChatTime } from '@/lib/chat-time';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useMemo } from 'react';

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string | null;
  active?: boolean;
}

function previewTextFor(preview: Conversation['lastMessage'] | undefined): string {
  if (!preview) {
    return 'No messages yet';
  }
  switch (preview.type) {
    case 'text':
      return preview.content || '';
    case 'image':
      return '📷 Image';
    case 'audio':
      return '🎵 Audio';
    case 'sticker':
      return '🌟 Sticker';
    case 'gif':
      return 'GIF';
    case 'system':
      return preview.content || '';
    default:
      return preview.content;
  }
}

export function ConversationListItem({
  conversation,
  currentUserId,
  active,
}: ConversationListItemProps) {
  const unread = useChatStore(
    (s) => s.unreadByConversation[conversation._id] ?? 0
  );
  const presence = useChatStore((s) => s.presence);
  const peer: UserBasic | null = getDirectConversationPeer(conversation, currentUserId);

  const isOnline = useMemo(
    () => (peer ? !!presence[peer._id]?.isOnline : false),
    [peer, presence]
  );

  const displayName = getConversationDisplayName(conversation, currentUserId);
  const avatarUrl = getConversationAvatarUrl(conversation, currentUserId);

  return (
    <Link
      href={`/chat/${conversation._id}`}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
        active
          ? 'bg-bg-highlight'
          : 'hover:bg-bg-elevated'
      )}
    >
      <div className="relative">
        <Avatar
          src={avatarUrl}
          name={displayName}
          size={44}
          status={conversation.type === 'direct' ? (isOnline ? 'online' : 'offline') : 'none'}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-body font-medium text-text-primary">
            {displayName}
          </p>
          <span className="ml-auto shrink-0 text-caption text-text-muted">
            {formatChatTime(
              conversation.lastMessage?.createdAt ?? conversation.lastActivity
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="truncate text-caption text-text-secondary">
            {previewTextFor(conversation.lastMessage)}
          </p>
          {unread > 0 && (
            <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-black">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
