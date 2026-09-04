'use client';

import type { Message } from '@/interfaces';
import { Button } from '@/components/ui/button';
import { ImagePlus, Send, Smile, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ChangeEvent, type KeyboardEvent, type RefObject } from 'react';

interface ChatInputBarProps {
  text: string;
  setText: (v: string) => void;
  replyTo: Message | null;
  cancelReply: () => void;
  onSend: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPickFile: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  pendingImage: { file: File; previewUrl: string } | null;
  cancelPendingImage: () => void;
  isUploading: boolean;
  uploadProgress: number | null;
  editingMessageId: string | null;
  editDraft: string;
  setEditDraft: (v: string) => void;
  cancelEdit: () => void;
  submitEdit: () => void;
}

export function ChatInputBar(props: ChatInputBarProps) {
  const {
    text,
    setText,
    replyTo,
    cancelReply,
    onSend,
    onKeyDown,
    onPickFile,
    fileInputRef,
    pendingImage,
    cancelPendingImage,
    isUploading,
    uploadProgress,
    editingMessageId,
    editDraft,
    setEditDraft,
    cancelEdit,
    submitEdit,
  } = props;

  const isEditing = !!editingMessageId;
  const draft = isEditing ? editDraft : text;
  const setDraft = isEditing ? setEditDraft : setText;
  const canSubmit =
    !isEditing && (draft.trim().length > 0 || !!pendingImage) && !isUploading;
  const canSubmitEdit = isEditing && draft.trim().length > 0 && !isUploading;

  return (
    <div className="border-t border-border bg-bg-secondary/60 px-3 py-3 backdrop-blur">
      {isEditing ? (
        <div className="mb-2 flex items-center justify-between rounded-md bg-bg-elevated px-3 py-2">
          <p className="text-caption text-text-secondary">Editing message</p>
          <button
            type="button"
            aria-label="Cancel edit"
            onClick={cancelEdit}
            className="text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        replyTo && (
          <div className="mb-2 flex items-start justify-between rounded-md bg-bg-elevated px-3 py-2">
            <div className="min-w-0">
              <p className="text-caption font-medium text-text-secondary">
                Replying to {replyTo.sender.name}
              </p>
              <p className="truncate text-caption text-text-muted">
                {replyTo.deletedAt
                  ? 'Tin nhắn đã bị thu hồi'
                  : replyTo.type === 'text'
                    ? replyTo.content
                    : `[${replyTo.type}]`}
              </p>
            </div>
            <button
              type="button"
              aria-label="Cancel reply"
              onClick={cancelReply}
              className="text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      )}

      {isUploading && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-caption text-text-secondary">
            <span>Uploading…</span>
            <span>{uploadProgress ?? 0}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg-highlight">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${uploadProgress ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {pendingImage && !isEditing && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-bg-elevated p-2">
          <div className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage.previewUrl}
              alt={pendingImage.file.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-caption font-medium text-text-primary">
              {pendingImage.file.name}
            </p>
            <p className="text-caption text-text-muted">
              {(pendingImage.file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            aria-label="Remove image"
            onClick={cancelPendingImage}
            disabled={isUploading}
            className="text-text-muted hover:text-text-primary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          aria-label="Attach image"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isEditing}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-highlight hover:text-text-primary disabled:opacity-50'
          )}
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />

        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={isEditing ? 'Edit message…' : 'Type a message'}
          className="flex-1 resize-none rounded-md border border-border bg-bg-elevated px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          disabled={isUploading}
        />

        <button
          type="button"
          aria-label="Insert emoji"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-bg-highlight hover:text-text-primary"
          tabIndex={-1}
        >
          <Smile className="h-5 w-5" />
        </button>

        {isEditing ? (
          <Button
            onClick={submitEdit}
            disabled={!canSubmitEdit}
            size="sm"
          >
            Save
          </Button>
        ) : (
          <Button
            onClick={onSend}
            disabled={!canSubmit}
            size="icon"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
