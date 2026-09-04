'use client';

import type { Contact } from '@/interfaces';
import { Avatar } from './Avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Trash2 } from 'lucide-react';

interface ContactItemProps {
  contact: Contact;
  onMessage: (contact: Contact) => void;
  onRemove: (contactId: string) => void;
  disabled?: boolean;
}

export function ContactItem({
  contact,
  onMessage,
  onRemove,
  disabled,
}: ContactItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-bg-elevated p-3">
      <Avatar
        src={contact.user.avatarUrl}
        name={contact.user.name}
        size={40}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-text-primary">
          {contact.user.name}
        </p>
        <p className="truncate text-caption text-text-muted">
          {contact.user.email}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onMessage(contact)}
          disabled={disabled}
        >
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
          Chat
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Remove contact"
          onClick={() => onRemove(contact.contactId)}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
