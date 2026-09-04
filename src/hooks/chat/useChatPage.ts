import { useAuth } from '@/hooks/useAuth';
import {
  useGetContactRequestsQuery,
  useGetConversationsQuery,
} from '@/services';
import { useChatStore } from '@/stores/chat.store';
import { useEffect, useMemo, useState } from 'react';

export type ChatSidebarTab = 'chats' | 'contacts';

/**
 * Drives the chat list page (sidebar) — list of conversations, friend
 * requests, and the create-group dialog state.
 */
export const useChatPage = () => {
  const { user } = useAuth();
  const currentUserId = user?._id ?? null;

  const [tab, setTab] = useState<ChatSidebarTab>('chats');
  const [search, setSearch] = useState('');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const {
    data: conversations,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useGetConversationsQuery();

  const { data: requestsData } = useGetContactRequestsQuery();

  const setPendingContactRequestCount = useChatStore(
    (s) => s.setPendingContactRequestCount
  );

  // Mirror the request count into the store so the sidebar badge stays in sync.
  useEffect(() => {
    if (requestsData) {
      setPendingContactRequestCount(requestsData.incoming.length);
    }
  }, [requestsData, setPendingContactRequestCount]);

  const filteredConversations = useMemo(() => {
    if (!conversations) {
      return [];
    }
    const q = search.trim().toLowerCase();
    if (!q) {
      return conversations;
    }
    return conversations.filter((c) => {
      if (c.type === 'group') {
        return c.name?.toLowerCase().includes(q);
      }
      const other = c.members.find((m) => m._id !== currentUserId);
      return (
        other?.name?.toLowerCase().includes(q) ||
        other?.email?.toLowerCase().includes(q)
      );
    });
  }, [conversations, search, currentUserId]);

  return {
    currentUserId,
    tab,
    setTab,
    search,
    setSearch,
    conversations: filteredConversations,
    isLoadingConversations,
    createGroupOpen,
    setCreateGroupOpen,
    incomingRequests: requestsData?.incoming ?? [],
    outgoingRequests: requestsData?.outgoing ?? [],
    refetchConversations,
  };
};
