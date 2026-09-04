import { presenceApi } from '@/api';
import { useChatStore } from '@/stores/chat.store';
import { useEffect, useRef } from 'react';

interface UsePresenceHeartbeatOptions {
  /** Enable/disable the heartbeat loop (e.g. false while logged out). */
  enabled?: boolean;
  /** Interval in ms. Default 30000 (30s) — matches the spec. */
  intervalMs?: number;
}

/**
 * Pings the backend presence endpoint on a fixed interval so the server
 * keeps the user marked as online. Also pushes the resulting presence
 * record into the chat store for instant UI updates.
 */
export function usePresenceHeartbeat(
  options: UsePresenceHeartbeatOptions = {}
) {
  const { enabled = true, intervalMs = 30_000 } = options;

  const setPresence = useChatStore((s) => s.setPresence);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      try {
        const res = await presenceApi.heartbeat();
        // res is the raw AxiosService envelope: { success, data: UserPresence }
        const presence = res?.data;
        if (presence && userIdRef.current) {
          setPresence(userIdRef.current, presence);
        }
      } catch {
        // Silently retry next interval; server may be temporarily down.
      }
    };

    // Fire one immediately so the user is online as soon as we connect.
    tick();

    timer = setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [enabled, intervalMs, setPresence]);

  return {
    setUserIdForHeartbeat: (userId: string | null) => {
      userIdRef.current = userId;
    },
  };
}
