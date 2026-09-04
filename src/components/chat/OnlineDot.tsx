'use client';

import type { PresenceMap } from '@/interfaces';
import { cn } from '@/lib/utils';

interface OnlineDotProps {
  /** Presence record keyed by userId. */
  presence: PresenceMap | undefined;
  userId: string | undefined;
  size?: number;
  className?: string;
}

export function OnlineDot({
  presence,
  userId,
  size = 10,
  className,
}: OnlineDotProps) {
  const isOnline = !!userId && !!presence?.[userId]?.isOnline;
  return (
    <span
      aria-label={isOnline ? 'Online' : 'Offline'}
      className={cn(
        'block rounded-full border-2 border-bg-secondary',
        isOnline ? 'bg-accent' : 'bg-text-muted',
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
