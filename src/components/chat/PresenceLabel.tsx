'use client';

import type { UserPresence } from '@/interfaces';
import { formatRelativeShort } from '@/lib/chat-time';

interface PresenceLabelProps {
  presence: UserPresence | undefined;
  className?: string;
}

export function PresenceLabel({ presence, className }: PresenceLabelProps) {
  if (!presence) {
    return <span className={className}>—</span>;
  }
  if (presence.isOnline) {
    return (
      <span className={className} data-testid="presence-online">
        Online
      </span>
    );
  }
  if (!presence.lastSeen) {
    return (
      <span className={className} data-testid="presence-offline">
        Offline
      </span>
    );
  }
  return (
    <span className={className} data-testid="presence-lastseen">
      Active {formatRelativeShort(presence.lastSeen)}
    </span>
  );
}
