'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  /** Display name (used to derive the initial when src is missing). */
  name?: string | null;
  size?: number;
  className?: string;
  /** Optional small ring color (e.g. "online" -> accent dot). */
  status?: 'online' | 'offline' | 'none';
}

export function Avatar({
  src,
  name,
  size = 40,
  className,
  status = 'none',
}: AvatarProps) {
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ?? 'Avatar'}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-bg-highlight to-bg-elevated text-text-secondary"
          style={{ fontSize: Math.max(12, Math.round(size * 0.4)) }}
        >
          <span className="font-semibold">{initial}</span>
        </div>
      )}
      {status !== 'none' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-bg-secondary',
            status === 'online' ? 'bg-accent' : 'bg-text-muted'
          )}
          style={{
            width: Math.max(8, Math.round(size * 0.25)),
            height: Math.max(8, Math.round(size * 0.25)),
          }}
          aria-label={status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
