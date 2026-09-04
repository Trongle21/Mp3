'use client';

import type { PendingContactRequest } from '@/interfaces';
import { Avatar } from './Avatar';
import { Button } from '@/components/ui/button';
import { formatChatTime } from '@/lib/chat-time';

interface ContactRequestItemProps {
  request: PendingContactRequest;
  onAccept: (contactId: string) => void;
  onDecline: (contactId: string) => void;
  disabled?: boolean;
}

export function ContactRequestItem({
  request,
  onAccept,
  onDecline,
  disabled,
}: ContactRequestItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-bg-elevated p-3">
      <Avatar
        src={request.requester.avatarUrl}
        name={request.requester.name}
        size={40}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-text-primary">
          {request.requester.name}
        </p>
        <p className="truncate text-caption text-text-muted">
          {request.requester.email}
        </p>
        <p className="mt-0.5 text-caption text-text-muted">
          {formatChatTime(request.createdAt)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDecline(request._id)}
          disabled={disabled}
        >
          Decline
        </Button>
        <Button
          size="sm"
          onClick={() => onAccept(request._id)}
          disabled={disabled}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
