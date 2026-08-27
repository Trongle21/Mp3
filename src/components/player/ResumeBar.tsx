"use client";

import { Play, X } from "lucide-react";
import { usePlayerStore } from "@/stores/player.store";

export function ResumeBar() {
  const pending = usePlayerStore((s) => s.pendingResume);
  const accept = usePlayerStore((s) => s.acceptResume);
  const dismiss = usePlayerStore((s) => s.dismissResume);

  if (!pending) return null;

  const { track, positionSec } = pending;

  return (
    <div
      className="fixed bottom-[72px] sm:bottom-[82px] left-0 right-0 z-30 border-t border-border/50 bg-bg-secondary/95 backdrop-blur-md md:left-sidebar"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-bg-highlight">
          <Play className="h-4 w-4 text-text-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-text-primary">
            Resume{" "}
            <span className="text-text-muted">&ldquo;{track.title}&rdquo;</span>
          </p>
          <p className="truncate text-xs text-text-muted">
            {track.artist}
            {positionSec > 0
              ? ` · ${Math.floor(positionSec / 60)}:${String(positionSec % 60).padStart(2, "0")}`
              : ""}
          </p>
        </div>
        <button
          onClick={() => accept()}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-black transition-transform hover:scale-105"
        >
          <Play className="h-3 w-3 fill-black" />
          Resume
        </button>
        <button
          onClick={() => dismiss()}
          aria-label="Dismiss"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-highlight hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
