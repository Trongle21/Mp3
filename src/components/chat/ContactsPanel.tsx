'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Contact, PendingContactRequest } from '@/interfaces';
import { ContactItem } from './ContactItem';
import { ContactRequestItem } from './ContactRequestItem';
import { EmptyState } from '@/components/shared/EmptyState';
import { UserPlus, Users } from 'lucide-react';

interface ContactsPanelProps {
  contacts: Contact[];
  incoming: PendingContactRequest[];
  outgoing: PendingContactRequest[];
  isLoading: boolean;
  search: string;
  setSearch: (v: string) => void;
  recipientId: string;
  setRecipientId: (v: string) => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  onSendRequest: () => Promise<void>;
  onSendByEmail: () => Promise<void>;
  onAccept: (contactId: string) => Promise<void>;
  onDecline: (contactId: string) => Promise<void>;
  onRemove: (contactId: string) => Promise<void>;
  onMessageContact: (c: Contact) => void;
  isSending: boolean;
  isDeciding: boolean;
  isRemoving: boolean;
}

export function ContactsPanel(props: ContactsPanelProps) {
  const {
    contacts,
    incoming,
    outgoing,
    isLoading,
    search,
    setSearch,
    // recipientId,
    // setRecipientId,
    emailInput,
    setEmailInput,
    // onSendRequest,
    onSendByEmail,
    onAccept,
    onDecline,
    onRemove,
    onMessageContact,
    isSending,
    isDeciding,
    isRemoving,
  } = props;

  const showEmpty = !isLoading && contacts.length === 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-md bg-bg-elevated p-3">
        <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
          Add a friend
        </p>
        {/* <div className="flex gap-2">
          <Input
            placeholder="User ID"
            value={recipientId}
            onChange={e => setRecipientId(e.target.value)}
          />
          <Button
            onClick={onSendRequest}
            disabled={!recipientId.trim() || isSending}
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Send
          </Button>
        </div> */}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Friend's email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={onSendByEmail}
            disabled={!emailInput.trim() || isSending}
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Invite
          </Button>
        </div>
      </div>

      {incoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
            Friend requests ({incoming.length})
          </p>
          <div className="space-y-2">
            {incoming.map(r => (
              <ContactRequestItem
                key={r._id}
                request={r}
                onAccept={onAccept}
                onDecline={onDecline}
                disabled={isDeciding}
              />
            ))}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="space-y-2">
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
            Pending ({outgoing.length})
          </p>
          <div className="space-y-2">
            {outgoing.map(r => (
              <div
                key={r._id}
                className="flex items-center gap-3 rounded-md bg-bg-elevated px-3 py-2"
              >
                <p className="truncate text-caption text-text-secondary">
                  Waiting for {r.recipient.name} to accept
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
            Contacts
          </p>
          <Input
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-[200px]"
          />
        </div>

        {showEmpty && (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Send a friend request using the form above."
          />
        )}

        {contacts.length > 0 && (
          <div className="space-y-2">
            {contacts.map(c => (
              <ContactItem
                key={c.contactId}
                contact={c}
                onMessage={onMessageContact}
                onRemove={onRemove}
                disabled={isRemoving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
