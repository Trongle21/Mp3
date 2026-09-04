import { useChatStore } from '@/stores/chat.store';
import { useEffect, useMemo } from 'react';

/**
 * Syncs the store-side `conversationMeta` / `conversationPreviews` with the
 * fetched conversation list so that the sidebar list and chat-window header
 * have the data they need without re-querying.
 */
export const useSyncConversationsToStore = (
  conversations:
    | Array<{
        _id: string;
        type: 'direct' | 'group';
        name?: string;
        avatarUrl?: string | null;
        owner?: unknown;
        members: unknown[];
        lastMessage?: unknown;
      }>
    | undefined
) => {
  const upsertConversation = useChatStore((s) => s.upsertConversation);
  const removeConversation = useChatStore((s) => s.removeConversation);

  const ids = useMemo(
    () => (conversations ?? []).map((c) => c._id).join(','),
    [conversations]
  );

  useEffect(() => {
    if (!conversations) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conversations.forEach((c: any) => {
      upsertConversation(c);
    });
  }, [ids, upsertConversation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Remove stale conversations from the store (e.g. after a list refresh).
  useEffect(() => {
    const meta = useChatStore.getState().conversationMeta;
    const knownIds = new Set((conversations ?? []).map((c) => c._id));
    Object.keys(meta).forEach((id) => {
      if (!knownIds.has(id)) {
        removeConversation(id);
      }
    });
  }, [ids, conversations, removeConversation]);
};
