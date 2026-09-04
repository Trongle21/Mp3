import {
  useGetContactRequestsQuery,
  useGetConversationsQuery,
} from '@/services';
import type { Contact } from '@/interfaces';
import { useChatStore } from '@/stores/chat.store';
import { useMemo } from 'react';
import { useChatPage, type ChatSidebarTab } from './useChatPage';
import { useContactsPanel } from './useContactsPanel';
import { useCreateGroupChat } from './useCreateGroupChat';

interface UseChatSidebarOptions {
  onNavigateToConversation?: (conversationId: string) => void;
}

/**
 * Aggregates the state needed by the chat-list sidebar: tab, search,
 * pending request badge, conversation list, contacts, and the create-group
 * dialog. Also exposes `onMessageContact` for opening a 1-1 chat directly
 * from a contact row.
 *
 * Search state is exposed as `chatSearch`/`setChatSearch` and
 * `contactsSearch`/`setContactsSearch` so the two input boxes never collide.
 */
export const useChatSidebar = (options?: UseChatSidebarOptions) => {
  const page = useChatPage();
  const contactsPanel = useContactsPanel();
  const groupChat = useCreateGroupChat({
    onCreated: (id) => {
      page.setCreateGroupOpen(false);
      options?.onNavigateToConversation?.(id);
    },
  });

  const pendingRequestCount = page.incomingRequests.length;

  const totalUnread = useMemo(() => {
    const map = useChatStore.getState().unreadByConversation;
    return Object.values(map).reduce((sum, n) => sum + n, 0);
  }, [page.conversations.length]);

  const onMessageContact = async (contact: Contact) => {
    if (!contact?.user?._id) {
      return;
    }
    await groupChat.startDirect(contact.user._id);
  };

  return {
    ...page,
    chatSearch: page.search,
    setChatSearch: page.setSearch,
    contactsSearch: contactsPanel.search,
    setContactsSearch: contactsPanel.setSearch,
    ...contactsPanel,
    ...groupChat,
    pendingRequestCount,
    totalUnread,
    onMessageContact,
  };
};

export type { ChatSidebarTab };

// Re-export so consumers don't need separate import paths.
export { useGetContactRequestsQuery, useGetConversationsQuery };
