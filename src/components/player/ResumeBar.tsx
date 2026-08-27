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
      className="fixed bottom-[81px] sm:bottom-[91px] left-0 right-0 z-30 border-t border-bg-highlight bg-bg-elevated/95 backdrop-blur md:left-sidebar"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2 sm:gap-4 sm:px-6 sm:py-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-bg-highlight">
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <Play className="h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-caption text-text-primary">Resume &ldquo;{track.title}&rdquo;?</p>
          <p className="truncate text-caption text-text-muted">
            {track.artist}
            {positionSec > 0 ? ` · at ${positionSec}s` : ""}
          </p>
        </div>
        <button
          onClick={() => accept()}
          className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-caption font-medium text-black transition-transform hover:scale-105 hover:bg-accent-hover sm:px-4 sm:py-2"
        >
          <Play className="h-3.5 w-3.5 fill-black sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Resume</span>
        </button>
        <button
          onClick={() => dismiss()}
          aria-label="Dismiss"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-highlight hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}