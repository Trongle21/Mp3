'use client';

import type { Conversation } from '@/interfaces';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Avatar } from './Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePicker } from '@/components/shared/ImagePicker';
import { X, Trash2, UserMinus, LogOut } from 'lucide-react';
import { formatChatTime } from '@/lib/chat-time';

interface GroupInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
  currentUserId: string | null;
  isOwner: boolean;
  onRename: (name: string) => Promise<void> | void;
  onAvatar: (file: File) => Promise<void> | void;
  onAddMember: (userId: string) => Promise<void> | void;
  onRemoveMember: (userId: string) => Promise<void> | void;
  onLeaveGroup: () => Promise<void> | void;
}

export function GroupInfoDialog(props: GroupInfoDialogProps) {
  const {
    open,
    onOpenChange,
    conversation,
    currentUserId,
    isOwner,
    onRename,
    onAvatar,
    onAddMember,
    onRemoveMember,
    onLeaveGroup,
  } = props;

  const [name, setName] = useState(conversation.name ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [addUserId, setAddUserId] = useState('');

  const handleRename = async () => {
    await onRename(name);
  };

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
              Conversation info
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

          {conversation.type === 'group' ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={conversation.avatarUrl ?? null}
                  name={conversation.name}
                  size={56}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-text-primary">
                    {conversation.name}
                  </p>
                  <p className="text-caption text-text-muted">
                    Created {formatChatTime(conversation.createdAt)}
                  </p>
                </div>
              </div>

              {isOwner && (
                <div className="space-y-2">
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Group name"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleRename}
                      disabled={!name.trim() || name === conversation.name}
                    >
                      Save name
                    </Button>
                  </div>
                  <ImagePicker
                    file={avatarFile}
                    onChange={setAvatarFile}
                    label="Group avatar"
                    accept="image/jpeg,image/png,image/webp"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (avatarFile) {
                          await onAvatar(avatarFile);
                          setAvatarFile(null);
                        }
                      }}
                      disabled={!avatarFile}
                    >
                      Upload avatar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                  Members ({conversation.members.length})
                </p>
                <div className="space-y-1">
                  {conversation.members.map((m) => {
                    const isSelf = m._id === currentUserId;
                    return (
                      <div
                        key={m._id}
                        className="flex items-center gap-3 rounded-md bg-bg-elevated px-3 py-2"
                      >
                        <Avatar
                          src={m.avatarUrl}
                          name={m.name}
                          size={32}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body text-text-primary">
                            {m.name} {isSelf && '(you)'}
                          </p>
                          <p className="truncate text-caption text-text-muted">
                            {m.email}
                          </p>
                        </div>
                        {isOwner && !isSelf && (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Remove member"
                            onClick={() => onRemoveMember(m._id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isOwner && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add member by user ID"
                      value={addUserId}
                      onChange={e => setAddUserId(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (addUserId.trim()) {
                          await onAddMember(addUserId.trim());
                          setAddUserId('');
                        }
                      }}
                      disabled={!addUserId.trim()}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <Button
                  variant="danger"
                  onClick={onLeaveGroup}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave group
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {conversation.members
                .filter(m => m._id !== currentUserId)
                .map(m => (
                  <div
                    key={m._id}
                    className="flex items-center gap-3 rounded-md bg-bg-elevated px-3 py-2"
                  >
                    <Avatar
                      src={m.avatarUrl}
                      name={m.name}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body text-text-primary">
                        {m.name}
                      </p>
                      <p className="truncate text-caption text-text-muted">
                        {m.email}
                      </p>
                    </div>
                  </div>
                ))}
              <Button
                variant="danger"
                onClick={onLeaveGroup}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete conversation
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
