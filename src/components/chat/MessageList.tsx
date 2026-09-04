'use client';

import type { LocalMessage } from '@/interfaces';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: LocalMessage[];
  selfUserId: string | null;
  isLoading: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
  onReact: (messageId: string, emoji: string) => void;
  onStartEdit: (m: LocalMessage) => void;
  onDelete: (m: LocalMessage) => void;
  onReply: (m: LocalMessage) => void;
  onJumpToMessage: (messageId: string) => void;
  highlightedMessageId: string | null;
  onClearHighlight: () => void;
}

/**
 * Scrollable message list with:
 *  - Infinite-scroll-up via `onLoadMore` when the user scrolls to the top
 *  - "New messages ↓" pill when new messages arrive while scrolled away
 *  - Click-to-jump on reply previews: scroll to the source message and flash
 *    it. If the message is not currently rendered (out of pagination window),
 *    the caller is expected to fetch it, drop it into the store, and re-trigger.
 */
export function MessageList({
  messages,
  selfUserId,
  isLoading,
  hasMore,
  isFetchingMore,
  onLoadMore,
  onReact,
  onStartEdit,
  onDelete,
  onReply,
  onJumpToMessage,
  highlightedMessageId,
  onClearHighlight,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number>(0);
  const stickToBottomRef = useRef(true);
  // id -> root <div> of the rendered bubble, populated by the ref callback
  // below. Using a Map (not React refs) so we can look up by message id at
  // scroll time without rebuilding the whole list.
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [messages]
  );

  const registerItem = (id: string | undefined) => (el: HTMLDivElement | null) => {
    if (!id) {
      return;
    }
    if (el) {
      itemRefs.current.set(id, el);
    } else {
      itemRefs.current.delete(id);
    }
  };

  // Initial mount: scroll to the very bottom once messages arrive.
  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    if (stickToBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sorted.length]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 120;
    setShowJumpToLatest(distanceFromBottom > 200);

    if (el.scrollTop < 60 && hasMore && !isFetchingMore) {
      // Capture height so we can restore scroll position after prepending.
      lastHeightRef.current = el.scrollHeight;
      onLoadMore();
    }
  };

  // After loading older messages, keep the previously visible messages in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !lastHeightRef.current) {
      return;
    }
    const newHeight = el.scrollHeight;
    el.scrollTop = newHeight - lastHeightRef.current;
    lastHeightRef.current = 0;
  }, [sorted.length]);

  // Scroll to the highlighted message whenever it (or the rendered list)
  // changes. We retry across a few frames because the store update that
  // unblocks the render is asynchronous.
  useEffect(() => {
    if (!highlightedMessageId) {
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const tryScroll = () => {
      if (cancelled) {
        return;
      }
      const el = itemRefs.current.get(highlightedMessageId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const timer = window.setTimeout(() => {
          if (!cancelled) {
            onClearHighlight();
          }
        }, 2000);
        return () => window.clearTimeout(timer);
      }
      attempts += 1;
      if (attempts < 30) {
        requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
    return () => {
      cancelled = true;
    };
  }, [highlightedMessageId, sorted.length, onClearHighlight]);

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    stickToBottomRef.current = true;
    setShowJumpToLatest(false);
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto px-3 py-3"
      >
        {isFetchingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
          </div>
        )}
        {!hasMore && sorted.length > 0 && (
          <div className="flex justify-center py-2">
            <span className="rounded-full bg-bg-elevated px-3 py-1 text-caption text-text-muted">
              Beginning of conversation
            </span>
          </div>
        )}
        {isLoading && sorted.length === 0 && (
          <div className="space-y-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  i % 2 === 0 ? 'justify-start' : 'justify-end'
                )}
              >
                <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-bg-elevated" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && sorted.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-caption text-text-muted">
              Say hi to start the conversation 👋
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {sorted.map(m => (
            <div
              key={m?._id}
              ref={registerItem(m?._id)}
              className={cn(
                m?._id === highlightedMessageId && 'animate-reply-highlight rounded-2xl'
              )}
            >
              <MessageBubble
                message={m}
                isSelf={m?.sender?._id === selfUserId}
                pending={m?._pending === true}
                selfUserId={selfUserId}
                onReact={emoji => onReact(m?._id, emoji)}
                onStartEdit={() => onStartEdit(m)}
                onDelete={() => onDelete(m)}
                onReply={() => onReply(m)}
                onJumpToMessage={() => {
                  const replyToId = m?.replyTo?._id;
                  if (replyToId) {
                    onJumpToMessage(replyToId);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {showJumpToLatest && (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-bg-elevated px-3 py-1.5 text-caption text-text-primary shadow-lg hover:bg-bg-highlight"
        >
          <ArrowDown className="mr-1 inline h-3 w-3" />
          New messages
        </button>
      )}
    </div>
  );
}
