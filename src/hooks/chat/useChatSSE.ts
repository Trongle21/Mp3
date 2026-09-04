import { SSE_ENDPOINT } from '@/api';
import type {
  Conversation,
  Message,
  Reaction,
  UserBasic,
} from '@/interfaces';
import { useChatStore } from '@/stores/chat.store';
import { useEffect, useRef } from 'react';

type SseEventName =
  | 'message:new'
  | 'message:edited'
  | 'message:deleted'
  | 'message:reaction'
  | 'conversation:created'
  | 'conversation:updated'
  | 'conversation:member_added'
  | 'conversation:member_removed'
  | 'conversation:read'
  | 'contact:request'
  | 'contact:accepted';

interface SseMessageNew {
  conversationId: string;
  message: Message;
}
interface SseMessageEdited {
  conversationId: string;
  message: Message;
}
interface SseMessageDeleted {
  conversationId: string;
  messageId: string;
}
interface SseMessageReaction {
  conversationId: string;
  messageId: string;
  reactions: Reaction[];
}
interface SseConversationUpdated {
  conversation: Conversation;
}
interface SseConversationMemberAdded {
  conversationId: string;
  addedUser: UserBasic;
  conversation: Conversation;
}
interface SseConversationMemberRemoved {
  conversationId: string;
  removedUserId: string;
  isLeaving: boolean;
}
interface SseConversationRead {
  conversationId: string;
  userId: string;
  readAt: string;
}
interface SseContactRequest {
  contactId: string;
  from: UserBasic;
}
interface SseContactAccepted {
  contactId: string;
  byUserId: string;
}

interface UseChatSSEOptions {
  token: string | null;
  /** Set to false to suspend (e.g. when not authenticated). */
  enabled?: boolean;
  /** Reconnect delay in ms (default 3000). */
  reconnectDelayMs?: number;
  onMessageNew?: (payload: SseMessageNew) => void;
  onMessageEdited?: (payload: SseMessageEdited) => void;
  onMessageDeleted?: (payload: SseMessageDeleted) => void;
  onMessageReaction?: (payload: SseMessageReaction) => void;
  onConversationCreated?: (payload: Conversation) => void;
  onConversationUpdated?: (payload: Conversation) => void;
  onConversationMemberAdded?: (
    payload: SseConversationMemberAdded
  ) => void;
  onConversationMemberRemoved?: (
    payload: SseConversationMemberRemoved
  ) => void;
  onConversationRead?: (payload: SseConversationRead) => void;
  onContactRequest?: (payload: SseContactRequest) => void;
  onContactAccepted?: (payload: SseContactAccepted) => void;
}

/**
 * Subscribes to the backend SSE event stream.
 *
 * - Connects with `?token=` because EventSource cannot send custom headers.
 * - Auto-reconnects on disconnect (e.g. server keepalive timeout, network blip).
 * - Dispatches all known events into the chat Zustand store; consumers can
 *   additionally subscribe via the onXxx callbacks for side effects (toasts,
 *   query invalidations, etc).
 */
export function useChatSSE(options: UseChatSSEOptions) {
  const {
    token,
    enabled = true,
    reconnectDelayMs = 3000,
    onMessageNew,
    onMessageEdited,
    onMessageDeleted,
    onMessageReaction,
    onConversationCreated,
    onConversationUpdated,
    onConversationMemberAdded,
    onConversationMemberRemoved,
    onConversationRead,
    onContactRequest,
    onContactAccepted,
  } = options;

  const handlersRef = useRef({
    onMessageNew,
    onMessageEdited,
    onMessageDeleted,
    onMessageReaction,
    onConversationCreated,
    onConversationUpdated,
    onConversationMemberAdded,
    onConversationMemberRemoved,
    onConversationRead,
    onContactRequest,
    onContactAccepted,
  });

  // Keep the latest callback references without re-subscribing on every render.
  handlersRef.current = {
    onMessageNew,
    onMessageEdited,
    onMessageDeleted,
    onMessageReaction,
    onConversationCreated,
    onConversationUpdated,
    onConversationMemberAdded,
    onConversationMemberRemoved,
    onConversationRead,
    onContactRequest,
    onContactAccepted,
  };

  useEffect(() => {
    if (!enabled || !token) {
      return;
    }

    let cancelled = false;
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
    const url = `${apiBase}${SSE_ENDPOINT}?token=${encodeURIComponent(token)}`;

    const dispatch = <T>(name: SseEventName, raw: string): T | null => {
      try {
        return JSON.parse(raw) as T;
      } catch (err) {
        console.warn(`[SSE] Failed to parse ${name}:`, err);
        return null;
      }
    };

    const connect = () => {
      if (cancelled) {
        return;
      }
      eventSource = new EventSource(url, { withCredentials: false });

      eventSource.addEventListener('message:new', (event) => {
        const payload = dispatch<SseMessageNew>('message:new', event.data);
        if (!payload) {
          return;
        }
        useChatStore
          .getState()
          .upsertMessage(payload.conversationId, payload.message);
        handlersRef.current.onMessageNew?.(payload);
      });

      eventSource.addEventListener('message:edited', (event) => {
        const payload = dispatch<SseMessageEdited>('message:edited', event.data);
        if (!payload) {
          return;
        }
        useChatStore.getState().patchMessage(
          payload.conversationId,
          payload.message._id,
          {
            content: payload.message.content,
            editedAt: payload.message.editedAt ?? null,
          }
        );
        handlersRef.current.onMessageEdited?.(payload);
      });

      eventSource.addEventListener('message:deleted', (event) => {
        const payload = dispatch<SseMessageDeleted>(
          'message:deleted',
          event.data
        );
        if (!payload) {
          return;
        }
        useChatStore.getState().patchMessage(
          payload.conversationId,
          payload.messageId,
          {
            deletedAt: new Date().toISOString(),
            content: 'Tin nhắn đã bị thu hồi',
            type: 'text',
          }
        );
        handlersRef.current.onMessageDeleted?.(payload);
      });

      eventSource.addEventListener('message:reaction', (event) => {
        const payload = dispatch<SseMessageReaction>(
          'message:reaction',
          event.data
        );
        if (!payload) {
          return;
        }
        useChatStore.getState().patchMessage(
          payload.conversationId,
          payload.messageId,
          { reactions: payload.reactions }
        );
        handlersRef.current.onMessageReaction?.(payload);
      });

      eventSource.addEventListener('conversation:created', (event) => {
        const payload = dispatch<Conversation>(
          'conversation:created',
          event.data
        );
        if (!payload) {
          return;
        }
        useChatStore.getState().upsertConversation(payload);
        handlersRef.current.onConversationCreated?.(payload);
      });

      eventSource.addEventListener('conversation:updated', (event) => {
        const payload = dispatch<Conversation>(
          'conversation:updated',
          event.data
        );
        if (!payload) {
          return;
        }
        useChatStore.getState().upsertConversation(payload);
        handlersRef.current.onConversationUpdated?.(payload);
      });

      eventSource.addEventListener('conversation:member_added', (event) => {
        const payload = dispatch<SseConversationMemberAdded>(
          'conversation:member_added',
          event.data
        );
        if (!payload) {
          return;
        }
        useChatStore.getState().upsertConversation(payload.conversation);
        handlersRef.current.onConversationMemberAdded?.(payload);
      });

      eventSource.addEventListener(
        'conversation:member_removed',
        (event) => {
          const payload = dispatch<SseConversationMemberRemoved>(
            'conversation:member_removed',
            event.data
          );
          if (!payload) {
            return;
          }
          if (payload.isLeaving) {
            useChatStore.getState().removeConversation(payload.conversationId);
          } else {
            // Member list changed but we don't have the full updated doc here.
            // The caller can invalidate the conversation query if needed.
          }
          handlersRef.current.onConversationMemberRemoved?.(payload);
        }
      );

      eventSource.addEventListener('conversation:read', (event) => {
        const payload = dispatch<SseConversationRead>(
          'conversation:read',
          event.data
        );
        if (!payload) {
          return;
        }
        handlersRef.current.onConversationRead?.(payload);
      });

      eventSource.addEventListener('contact:request', (event) => {
        const payload = dispatch<SseContactRequest>(
          'contact:request',
          event.data
        );
        if (!payload) {
          return;
        }
        useChatStore.getState().incrementPendingContactRequestCount();
        handlersRef.current.onContactRequest?.(payload);
      });

      eventSource.addEventListener('contact:accepted', (event) => {
        const payload = dispatch<SseContactAccepted>(
          'contact:accepted',
          event.data
        );
        if (!payload) {
          return;
        }
        handlersRef.current.onContactAccepted?.(payload);
      });

      eventSource.onerror = (err) => {
        if (cancelled) {
          return;
        }
        console.warn('[SSE] disconnected, reconnecting...', err);
        eventSource?.close();
        eventSource = null;
        reconnectTimer = setTimeout(connect, reconnectDelayMs);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [token, enabled, reconnectDelayMs]);
}
