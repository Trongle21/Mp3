'use client';

import type { LocalMessage, Message, Reaction } from '@/interfaces';
import { cn } from '@/lib/utils';
import { formatChatTime } from '@/lib/chat-time';

interface ReactionRowProps {
  reactions: Reaction[];
  selfUserId: string | null;
  onToggle: (emoji: string) => void;
}

export function ReactionRow({
  reactions,
  selfUserId,
  onToggle,
}: ReactionRowProps) {
  if (!reactions || reactions.length === 0) {
    return null;
  }
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {reactions.map(r => {
        const reacted = !!selfUserId && r.users.includes(selfUserId);
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => onToggle(r.emoji)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption transition-colors',
              reacted
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-bg-elevated text-text-secondary hover:bg-bg-highlight'
            )}
            aria-pressed={reacted}
          >
            <span>{r.emoji}</span>
            <span>{r.users.length}</span>
          </button>
        );
      })}
    </div>
  );
}

interface ReplyPreviewProps {
  replyTo: Message['replyTo'];
  onClick?: () => void;
}

export function ReplyPreview({ replyTo, onClick }: ReplyPreviewProps) {
  if (!replyTo) {
    return null;
  }
  const deleted = !!replyTo.deletedAt;
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 block w-full rounded border-l-2 border-accent bg-bg-secondary/70 px-2 py-1 text-left text-caption transition-colors hover:bg-bg-highlight"
    >
      <p className="font-medium text-text-secondary">
        {replyTo.sender?.name ?? 'Unknown'}
      </p>
      <p
        className={cn(
          'truncate',
          deleted ? 'italic text-text-muted' : 'text-text-muted'
        )}
      >
        {deleted ? 'Tin nhắn đã bị thu hồi' : replyTo.content}
      </p>
    </button>
  );
}

function MediaPreview({ url, alt }: { url: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className="max-h-72 max-w-full rounded-md object-cover"
      loading="lazy"
    />
  );
}

interface MessageBubbleProps {
  message: LocalMessage;
  isSelf: boolean;
  pending?: boolean;
  selfUserId: string | null;
  onReact: (emoji: string) => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
  onJumpToMessage?: () => void;
}

export function MessageBubble({
  message,
  isSelf,
  pending,
  selfUserId,
  onReact,
  onStartEdit,
  onDelete,
  onReply,
  onJumpToMessage,
}: MessageBubbleProps) {
  const deleted = !!message.deletedAt;
  const canEditDelete = isSelf && !deleted;
  const showMenu = !deleted;

  if (message?.type === 'system') {
    return (
      <div className="my-3 flex justify-center">
        <span className="rounded-full bg-bg-elevated px-3 py-1 text-caption text-text-muted">
          {message?.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex w-full gap-2',
        isSelf ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'relative max-w-[75%] rounded-2xl px-4 py-2 text-body shadow-sm',
          isSelf
            ? 'bg-accent text-black rounded-br-sm'
            : 'bg-bg-elevated text-text-primary rounded-bl-sm',
          deleted && 'italic text-text-muted',
          pending && 'opacity-70'
        )}
      >
        {!isSelf && (
          <p className="mb-1 text-caption font-semibold text-text-secondary">
            {message?.sender?.name}
          </p>
        )}
        <ReplyPreview
          replyTo={message.replyTo ?? null}
          onClick={onJumpToMessage}
        />

        {message?.type === 'image' && message?.mediaUrl && !deleted ? (
          <MediaPreview
            url={message?.mediaUrl}
            alt="attachment"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words">{message?.content}</p>
        )}

        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-[10px]',
            isSelf ? 'text-black/70' : 'text-text-muted'
          )}
        >
          <span>{formatChatTime(message?.createdAt)}</span>
          {pending && <span>· Sending…</span>}
          {message?.editedAt && !deleted && <span>· edited</span>}
        </div>

        <ReactionRow
          reactions={message?.reactions ?? []}
          selfUserId={selfUserId}
          onToggle={onReact}
        />

        {showMenu && (
          <div
            className={cn(
              'absolute -top-3 flex gap-1 rounded-full bg-bg-secondary p-1 opacity-0 shadow transition-opacity group-hover:opacity-100',
              isSelf ? 'right-2' : 'left-2'
            )}
          >
            <button
              type="button"
              aria-label="Reply"
              onClick={onReply}
              className="rounded-full p-1 text-caption text-text-secondary hover:bg-bg-highlight"
            >
              ↩️
            </button>
            {canEditDelete && (
              <>
                <button
                  type="button"
                  aria-label="Edit"
                  onClick={onStartEdit}
                  className="rounded-full p-1 text-caption text-text-secondary hover:bg-bg-highlight"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={onDelete}
                  className="rounded-full p-1 text-caption text-danger hover:bg-bg-highlight"
                >
                  🗑
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
