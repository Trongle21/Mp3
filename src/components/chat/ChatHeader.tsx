'use client';

import { Button } from '@/components/ui/button';
import type { Conversation, PresenceMap } from '@/interfaces';
import {
  getConversationAvatarUrl,
  getConversationDisplayName,
  getDirectConversationPeer,
} from '@/lib/chat-conversation';
import { cn } from '@/lib/utils';
import { ArrowLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar } from './Avatar';
import { PresenceLabel } from './PresenceLabel';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string | null;
  presence: PresenceMap;
  onOpenInfo?: () => void;
}

export function ChatHeader({
  conversation,
  currentUserId,
  presence,
  onOpenInfo,
}: ChatHeaderProps) {
  const router = useRouter();
  const isGroup = conversation.type === 'group';
  const peer = getDirectConversationPeer(conversation, currentUserId);
  const peerPresence = peer ? presence[peer._id] : undefined;

  const displayName = getConversationDisplayName(conversation, currentUserId);
  const avatarUrl = getConversationAvatarUrl(conversation, currentUserId);

  return (
    <header className="flex items-center gap-3 border-b border-border bg-bg-secondary/60 px-4 py-3 backdrop-blur">
      <button
        type="button"
        aria-label="Back to chat list"
        onClick={() => router.push('/chat')}
        className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-bg-highlight hover:text-text-primary lg:hidden"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <Avatar
        src={avatarUrl}
        name={displayName}
        size={40}
        status={
          !isGroup && peer
            ? peerPresence?.isOnline
              ? 'online'
              : 'offline'
            : 'none'
        }
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-text-primary">
          {displayName}
        </p>
        <p
          className={cn(
            'truncate text-caption',
            peerPresence?.isOnline ? 'text-accent' : 'text-text-muted'
          )}
        >
          {isGroup ? (
            <>
              {conversation.members.length} member
              {conversation.members.length === 1 ? '' : 's'}
            </>
          ) : (
            <PresenceLabel presence={peerPresence} />
          )}
        </p>
      </div>

      {onOpenInfo && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Conversation info"
          onClick={onOpenInfo}
        >
          <Info className="h-4 w-4" />
        </Button>
      )}
    </header>
  );
}
