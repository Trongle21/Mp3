'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Contact } from '@/interfaces';
import { Avatar } from './Avatar';

interface CreateGroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  name: string;
  setName: (v: string) => void;
  selectedUserIds: string[];
  toggleMember: (userId: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function CreateGroupChatDialog(props: CreateGroupChatDialogProps) {
  const {
    open,
    onOpenChange,
    contacts,
    name,
    setName,
    selectedUserIds,
    toggleMember,
    onSubmit,
    isSubmitting,
  } = props;

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return contacts;
    }
    return contacts.filter(
      c =>
        c.user.name.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q)
    );
  })();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between">
            <Dialog.Title className="text-h3 text-text-primary">
              New group
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-3">
            <Input
              autoFocus
              placeholder="Group name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              placeholder="Search contacts"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md bg-bg-elevated p-2">
              {filtered.length === 0 && (
                <p className="p-3 text-center text-caption text-text-muted">
                  No contacts
                </p>
              )}
              {filtered.map(c => {
                const checked = selectedUserIds.includes(c.user._id);
                return (
                  <label
                    key={c.contactId}
                    className="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-bg-highlight"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMember(c.user._id)}
                      className="h-4 w-4 accent-accent"
                    />
                    <Avatar
                      src={c.user.avatarUrl}
                      name={c.user.name}
                      size={28}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body text-text-primary">
                        {c.user.name}
                      </p>
                      <p className="truncate text-caption text-text-muted">
                        {c.user.email}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-3">
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  type="button"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                disabled={
                  !name.trim() || selectedUserIds.length === 0 || isSubmitting
                }
                onClick={() => onSubmit()}
              >
                {isSubmitting ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
