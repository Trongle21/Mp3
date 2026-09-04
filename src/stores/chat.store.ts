import type {
  Conversation,
  Message,
  PresenceMap,
  UserBasic,
  UserPresence,
} from '@/interfaces';
import { create } from 'zustand';

interface ChatState {
  /** Map of conversationId -> Map of messageId -> Message. Keeps the SSE
   * stream and paginated history in a single, queryable place so the chat
   * window can read directly without re-fetching. */
  messagesByConversation: Record<string, Record<string, Message>>;

  /** Conversation IDs that have new messages while not active. Used for the
   * unread badge in the sidebar. */
  unreadByConversation: Record<string, number>;

  /** Currently open conversation (or null when on the chat list). */
  activeConversationId: string | null;

  /** Current user id (set by useChatConnection). Used to skip self-messages
   * when incrementing unread badges. */
  currentUserId: string | null;

  /** Map of conversationId -> last message preview, kept fresh by SSE so
   * the sidebar list can show previews without re-querying the full list. */
  conversationPreviews: Record<string, Conversation['lastMessage']>;

  /** Map of conversationId -> {name, avatarUrl, members, ...} so the chat
   * window header can render without re-querying. */
  conversationMeta: Record<
    string,
    Pick<
      Conversation,
      '_id' | 'type' | 'name' | 'avatarUrl' | 'members' | 'owner'
    >
  >;

  /** Batch presence map keyed by userId. */
  presence: PresenceMap;

  /** Number of pending incoming contact requests (badge in sidebar). */
  pendingContactRequestCount: number;

  /** Message ID that the user just clicked on a reply for; used by the
   * message list to scroll to it and apply a temporary highlight. */
  highlightedMessageId: string | null;

  setActiveConversation: (id: string | null) => void;
  setCurrentUserId: (id: string | null) => void;

  setHighlightedMessageId: (messageId: string | null) => void;

  upsertConversation: (conversation: Conversation) => void;
  patchConversation: (
    conversationId: string,
    patch: Partial<Conversation>
  ) => void;
  removeConversation: (conversationId: string) => void;

  /** Replace all messages for a conversation (e.g. after paginated fetch). */
  setMessages: (conversationId: string, messages: Message[]) => void;
  /** Prepend older messages (older cursor page) without losing scroll context. */
  prependMessages: (conversationId: string, messages: Message[]) => void;
  upsertMessage: (conversationId: string, message: Message) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  patchMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<Message>
  ) => void;

  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;

  setPresence: (userId: string, presence: UserPresence) => void;
  setPresenceBatch: (presence: PresenceMap) => void;

  setPendingContactRequestCount: (count: number) => void;
  incrementPendingContactRequestCount: () => void;

  reset: () => void;
}

function ensureConversationBucket(
  map: Record<string, Record<string, Message>>,
  conversationId: string
): Record<string, Message> {
  if (!map[conversationId]) {
    map[conversationId] = {};
  }
  return map[conversationId];
}

export const useChatStore = create<ChatState>((set, get) => ({
  messagesByConversation: {},
  unreadByConversation: {},
  activeConversationId: null,
  currentUserId: null,
  conversationPreviews: {},
  conversationMeta: {},
  presence: {},
  pendingContactRequestCount: 0,
  highlightedMessageId: null,

  setActiveConversation: (id) =>
    set((state) => {
      if (state.activeConversationId === id) {
        return state;
      }
      const nextUnread = { ...state.unreadByConversation };
      if (id && nextUnread[id]) {
        delete nextUnread[id];
      }
      return {
        activeConversationId: id,
        unreadByConversation: nextUnread,
      };
    }),

  setCurrentUserId: (id) => set({ currentUserId: id }),

  setHighlightedMessageId: (messageId) => set({ highlightedMessageId: messageId }),

  upsertConversation: (conversation) =>
    set((state) => {
      const meta = {
        _id: conversation._id,
        type: conversation.type,
        name: conversation.name,
        avatarUrl: conversation.avatarUrl ?? null,
        members: conversation.members,
        owner: conversation.owner ?? null,
      };
      return {
        conversationMeta: {
          ...state.conversationMeta,
          [conversation._id]: meta,
        },
        conversationPreviews: {
          ...state.conversationPreviews,
          [conversation._id]: conversation.lastMessage,
        },
      };
    }),

  patchConversation: (conversationId, patch) =>
    set((state) => {
      const meta = state.conversationMeta[conversationId];
      const updates: Partial<ChatState> = {};
      if (meta) {
        updates.conversationMeta = {
          ...state.conversationMeta,
          [conversationId]: { ...meta, ...patch } as typeof meta,
        };
      }
      if (patch.lastMessage !== undefined) {
        updates.conversationPreviews = {
          ...state.conversationPreviews,
          [conversationId]: patch.lastMessage,
        };
      }
      return updates;
    }),

  removeConversation: (conversationId) =>
    set((state) => {
      const meta = { ...state.conversationMeta };
      const previews = { ...state.conversationPreviews };
      const unread = { ...state.unreadByConversation };
      const messages = { ...state.messagesByConversation };
      delete meta[conversationId];
      delete previews[conversationId];
      delete unread[conversationId];
      delete messages[conversationId];
      return {
        conversationMeta: meta,
        conversationPreviews: previews,
        unreadByConversation: unread,
        messagesByConversation: messages,
        activeConversationId:
          state.activeConversationId === conversationId
            ? null
            : state.activeConversationId,
      };
    }),

  setMessages: (conversationId, messages) =>
    set((state) => {
      const bucket: Record<string, Message> = {};
      for (const m of messages) {
        bucket[m._id] = m;
      }
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: bucket,
        },
      };
    }),

  prependMessages: (conversationId, messages) =>
    set((state) => {
      const existing = ensureConversationBucket(
        state.messagesByConversation,
        conversationId
      );
      const next: Record<string, Message> = { ...existing };
      for (const m of messages) {
        next[m._id] = m;
      }
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: next,
        },
      };
    }),

  upsertMessage: (conversationId, message) =>
    set((state) => {
      const existing = ensureConversationBucket(
        state.messagesByConversation,
        conversationId
      );
      const wasMissing = !existing[message._id];
      const nextBucket = { ...existing, [message._id]: message };
      const isActive = state.activeConversationId === conversationId;
      const fromSelf = message.sender._id === state.currentUserId;
      const unreadInc = wasMissing && !isActive && !fromSelf ? 1 : 0;
      const nextUnread = unreadInc
        ? {
            ...state.unreadByConversation,
            [conversationId]:
              (state.unreadByConversation[conversationId] ?? 0) + 1,
          }
        : state.unreadByConversation;
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: nextBucket,
        },
        unreadByConversation: nextUnread,
        conversationPreviews: {
          ...state.conversationPreviews,
          [conversationId]: {
            content:
              message.type === 'text'
                ? message.content
                : message.type === 'system'
                  ? message.content
                  : `Sent a ${message.type}`,
            senderId: message.sender._id,
            senderName: message.sender.name,
            type: message.type,
            createdAt: message.createdAt,
          },
        },
      };
    }),

  removeMessage: (conversationId, messageId) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId];
      if (!existing || !existing[messageId]) {
        return state;
      }
      const next = { ...existing };
      delete next[messageId];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: next,
        },
      };
    }),

  patchMessage: (conversationId, messageId, patch) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId];
      if (!existing || !existing[messageId]) {
        return state;
      }
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: {
            ...existing,
            [messageId]: { ...existing[messageId], ...patch },
          },
        },
      };
    }),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadByConversation: {
        ...state.unreadByConversation,
        [conversationId]:
          (state.unreadByConversation[conversationId] ?? 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => {
      if (!state.unreadByConversation[conversationId]) {
        return state;
      }
      const next = { ...state.unreadByConversation };
      delete next[conversationId];
      return { unreadByConversation: next };
    }),

  setPresence: (userId, presence) =>
    set((state) => ({
      presence: { ...state.presence, [userId]: presence },
    })),

  setPresenceBatch: (presence) =>
    set((state) => ({ presence: { ...state.presence, ...presence } })),

  setPendingContactRequestCount: (count) =>
    set({ pendingContactRequestCount: count }),

  incrementPendingContactRequestCount: () =>
    set((state) => ({
      pendingContactRequestCount: state.pendingContactRequestCount + 1,
    })),

  reset: () =>
    set({
      messagesByConversation: {},
      unreadByConversation: {},
      activeConversationId: null,
      currentUserId: null,
      conversationPreviews: {},
      conversationMeta: {},
      presence: {},
      pendingContactRequestCount: 0,
      highlightedMessageId: null,
    }),
}));
