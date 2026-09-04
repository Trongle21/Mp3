import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { useEffect } from 'react';
import { useChatSSE } from './useChatSSE';
import { usePresenceHeartbeat } from './usePresenceHeartbeat';

/**
 * Top-level wiring hook for the chat subsystem.
 *
 * Mount this once near the app root (after auth is hydrated). It:
 *   1. Opens the SSE connection using the current access token.
 *   2. Keeps the store in sync with the current user id.
 *   3. Sends periodic presence heartbeats so `isOnline` stays true.
 */
export function useChatConnection() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const enabled = !!accessToken && !!userId;

  const setCurrentUserId = useChatStore((s) => s.setCurrentUserId);

  useEffect(() => {
    setCurrentUserId(userId);
  }, [userId, setCurrentUserId]);

  useChatSSE({ token: accessToken, enabled });

  usePresenceHeartbeat({ enabled });

  return {
    isConnected: enabled,
  };
}
