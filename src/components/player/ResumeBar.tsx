"use client";

import { Play, X } from "lucide-react";
import { usePlayerStore } from "@/stores/player.store";
import { coverUrl, formatDuration } from "@/lib/utils";

export function ResumeBar() {
  const pending = usePlayerStore((s) => s.pendingResume);
  const accept = usePlayerStore((s) => s.acceptResume);
  const dismiss = usePlayerStore((s) => s.dismissResume);

  if (!pending) return null;

  const { track, positionSec } = pending;
  const cover = track.coverKey ? coverUrl(track.coverKey) : null;

  return (
    <div className="fixed bottom-[90px] left-0 right-0 z-30 border-t border-bg-highlight bg-bg-elevated/95 backdrop-blur md:left-sidebar">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-bg-highlight">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={track.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <Play className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body text-text-primary">Resume &ldquo;{track.title}&rdquo;?</p>
          <p className="truncate text-caption text-text-muted">
            {track.artist}
            {positionSec > 0 ? ` · at ${formatDuration(positionSec)}` : ""}
          </p>
        </div>
        <button
          onClick={() => accept()}
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-body font-medium text-black hover:scale-105"
        >
          <Play className="h-4 w-4 fill-black" />
          Resume
        </button>
        <button
          onClick={() => dismiss()}
          aria-label="Dismiss"
          className="rounded-full p-2 text-text-muted hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}