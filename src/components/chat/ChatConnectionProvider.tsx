'use client';

import { useChatConnection } from '@/hooks/chat';

/**
 * No-op wrapper that mounts the global chat connection (SSE + heartbeat).
 * Drop this near the root of any subtree that needs real-time chat.
 */
export function ChatConnectionProvider() {
  useChatConnection();
  return null;
}
