import type {
  Conversation,
  UserBasic,
} from '@/interfaces';

/**
 * Resolve a human-readable display name for a conversation.
 *  - group conversations: their `name`
 *  - direct conversations: the other member's name (relative to currentUserId)
 */
export function getConversationDisplayName(
  conversation:
    | Pick<Conversation, '_id' | 'type' | 'name' | 'members'>
    | null
    | undefined,
  currentUserId: string | null
): string {
  if (!conversation) {
    return '';
  }
  if (conversation.type === 'group') {
    return conversation.name ?? 'Group';
  }
  const other = conversation.members.find((m) => m._id !== currentUserId);
  return other?.name ?? 'Direct message';
}

/** Resolve a direct conversation's avatar URL (the other member's avatar). */
export function getConversationAvatarUrl(
  conversation:
    | Pick<Conversation, '_id' | 'type' | 'avatarUrl' | 'members'>
    | null
    | undefined,
  currentUserId: string | null
): string | null {
  if (!conversation) {
    return null;
  }
  if (conversation.type === 'group') {
    return conversation.avatarUrl ?? null;
  }
  const other = conversation.members.find((m) => m._id !== currentUserId);
  return other?.avatarUrl ?? null;
}

/** Returns the "other" member of a 1-1 conversation, or null for groups. */
export function getDirectConversationPeer(
  conversation:
    | Pick<Conversation, '_id' | 'type' | 'members'>
    | null
    | undefined,
  currentUserId: string | null
): UserBasic | null {
  if (!conversation || conversation.type !== 'direct') {
    return null;
  }
  return (
    conversation.members.find((m) => m._id !== currentUserId) ?? null
  );
}
