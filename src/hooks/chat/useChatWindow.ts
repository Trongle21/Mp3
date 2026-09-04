import { useAuth } from '@/hooks/useAuth';
import {
  useGetPresenceBatchQuery,
  useMarkConversationReadMutation,
} from '@/services';
import {
  useGetConversationByIdQuery,
  useGetMessagesInfiniteQuery,
} from '@/services/chat';
import { messageApi } from '@/api/chat/chatApi';
import { useChatStore } from '@/stores/chat.store';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { LocalMessage, PresenceMap } from '@/interfaces';

interface UseChatWindowOptions {
  conversationId: string;
}

/**
 * Loads conversation metadata + message history for the chat window and
 * keeps the local store in sync with what we fetched. Also marks the
 * conversation as read whenever it becomes active.
 *
 * Realtime update path: `chat.store.messagesByConversation` is the single
 * source of truth for what gets rendered. The first REST history fetch
 * seeds the store; afterwards SSE events (new / edited / deleted / reaction)
 * and optimistic local sends flow into the same store, so the chat window
 * updates without a page refresh.
 */
export const useChatWindow = ({ conversationId }: UseChatWindowOptions) => {
  const { user } = useAuth();
  const currentUserId = user?._id ?? null;

  const setActiveConversation = useChatStore(s => s.setActiveConversation);
  const setMessages = useChatStore(s => s.setMessages);
  const upsertConversation = useChatStore(s => s.upsertConversation);
  const clearUnread = useChatStore(s => s.clearUnread);
  const upsertMessage = useChatStore(s => s.upsertMessage);
  const highlightedMessageId = useChatStore(s => s.highlightedMessageId);
  const setHighlightedMessageId = useChatStore(s => s.setHighlightedMessageId);

  const { data: conversation, isLoading: isLoadingConversation } =
    useGetConversationByIdQuery(conversationId);

  // Hydrate store as soon as the conversation detail is fetched.
  useEffect(() => {
    if (conversation) {
      upsertConversation(conversation);
    }
  }, [conversation, upsertConversation]);

  const {
    messages: historyMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
  } = useGetMessagesInfiniteQuery({ conversationId, limit: 30 });

  // Live messages live in the chat store and are driven by SSE + optimistic
  // sends. Reading from the store (instead of the React Query cache) is what
  // makes incoming messages appear without an F5.
  const liveMessageMap = useChatStore(
    s => s.messagesByConversation[conversationId]
  );
  const liveMessages = useMemo<LocalMessage[]>(() => {
    if (!liveMessageMap) {
      return [];
    }
    return Object.values(liveMessageMap).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [liveMessageMap]);

  // Seed the store from the first REST history fetch only once per
  // conversation. After that, SSE keeps it fresh and we don't want to
  // wipe out messages that arrived while the page was loading.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) {
      return;
    }
    if (!historyMessages.length) {
      return;
    }
    setMessages(conversationId, historyMessages);
    seededRef.current = true;
  }, [conversationId, historyMessages, setMessages]);
  useEffect(() => {
    seededRef.current = false;
  }, [conversationId]);

  // Mark active and clear unread whenever the user opens a chat.
  useEffect(() => {
    setActiveConversation(conversationId);
    clearUnread(conversationId);
    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, setActiveConversation, clearUnread]);

  const { mutate: markRead } = useMarkConversationReadMutation();
  useEffect(() => {
    if (!conversationId) {
      return;
    }
    // Fire-and-forget; the server already records the read marker.
    markRead({ conversationId });
  }, [conversationId, markRead]);

  // Pre-fetch presence for all conversation members so the header shows
  // online/offline status without re-querying.
  const memberIds = useMemo(() => {
    return (conversation?.members ?? []).map(m => m._id);
  }, [conversation]);
  const { data: memberPresence } = useGetPresenceBatchQuery(memberIds) as {
    data: PresenceMap | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  const setPresenceBatch = useChatStore(s => s.setPresenceBatch);
  useEffect(() => {
    if (memberPresence) {
      setPresenceBatch(memberPresence);
    }
  }, [memberPresence, setPresenceBatch]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  /**
   * Scrolls to and flashes a message. If the message isn't already in the
   * store (older than the pagination window or coming from a stale SSE
   * event), fetch it on-demand and let the list scroll to it once the
   * store update triggers a re-render.
   */
  const jumpToMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId || !messageId) {
        return;
      }
      const existing =
        useChatStore.getState().messagesByConversation[conversationId]?.[
          messageId
        ];
      if (existing) {
        setHighlightedMessageId(messageId);
        return;
      }
      try {
        const res = await messageApi.getById(conversationId, messageId);
        const fetched = res?.data?.data;
        if (fetched) {
          upsertMessage(conversationId, fetched);
          setHighlightedMessageId(messageId);
        }
      } catch {
        // The reply target is unreadable; leave it as-is.
      }
    },
    [conversationId, setHighlightedMessageId, upsertMessage]
  );

  const clearHighlight = useCallback(
    () => setHighlightedMessageId(null),
    [setHighlightedMessageId]
  );

  return {
    conversation,
    isLoadingConversation,
    messages: liveMessages,
    isLoadingMessages: isLoadingMessages && liveMessages.length === 0,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    currentUserId,
    jumpToMessage,
    highlightedMessageId,
    clearHighlight,
  };
};
