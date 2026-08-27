"use client";

import { useState } from "react";
import Link from "next/link";
import { ListMusic } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlayerKeyboardShortcuts } from "@/hooks/usePlayerKeyboardShortcuts";
import { CoverThumb } from "@/components/shared/CoverThumb";
import { SeekBar } from "./SeekBar";
import { VolumeControl } from "./VolumeControl";
import { QueuePanel } from "./QueuePanel";
import { PlayerControls } from "./PlayerControls";
import { ShuffleButton } from "./ShuffleButton";
import { RepeatModeButton } from "./RepeatModeButton";

export function PlayerBar() {
  const { currentTrack, positionSec, seek } = usePlayer();
  const [queueOpen, setQueueOpen] = useState(false);

  usePlayerKeyboardShortcuts();

  return (
    <>
      <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />

      {/* ── Mobile (< sm): stacked layout ── */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col border-t border-border bg-bg-secondary lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Seek bar spans full width */}
        <div className="px-4">
          <SeekBar
            positionSec={positionSec}
            durationSec={currentTrack?.durationSec ?? 0}
            onSeek={seek}
          />
        </div>

        {/* Two-column row: track info + controls */}
        <div className="flex items-center gap-3 px-4 py-2">
          {/* Track info */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {currentTrack ? (
              <>
                <Link href="/player" className="shrink-0">
                  <CoverThumb src={currentTrack.coverUrl} title={currentTrack.title} size={48} className="rounded" />
                </Link>
                <div className="min-w-0">
                  <p className="truncate text-body font-medium text-text-primary">{currentTrack.title}</p>
                  <p className="truncate text-caption text-text-muted">{currentTrack.artist}</p>
                </div>
              </>
            ) : (
              <p className="text-caption text-text-muted">Nothing playing</p>
            )}
          </div>

          {/* Playback controls (no seek bar on mobile bar — seek is above) */}
          <div className="flex items-center gap-3">
            <button onClick={() => setQueueOpen(true)} aria-label="Open queue" className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:text-text-primary sm:hidden">
              <ListMusic className="h-5 w-5" />
            </button>
            <PlayerControls size="sm" />
          </div>
        </div>
      </div>

      {/* ── Desktop (lg+): centered bar ── */}
      <div className="glass-player fixed inset-x-0 bottom-0 z-20 hidden h-player items-center justify-center border-t border-border px-4 lg:flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex w-[60%] items-center justify-between gap-4">
          {/* Track info */}
          <div className="flex w-1/4 min-w-0 items-center gap-3">
            {currentTrack ? (
              <>
                <Link href="/player" className="shrink-0">
                  <CoverThumb src={currentTrack.coverUrl} title={currentTrack.title} size={56} className="rounded" />
                </Link>
                <div className="min-w-0">
                  <p className="truncate text-body font-medium text-text-primary">{currentTrack.title}</p>
                  <p className="truncate text-caption text-text-muted">{currentTrack.artist}</p>
                </div>
              </>
            ) : (
              <p className="text-caption text-text-muted">Nothing playing</p>
            )}
          </div>

          {/* Controls + seek */}
          <div className="flex w-1/2 max-w-xl flex-col items-center gap-1">
            <div className="flex items-center gap-5">
              <ShuffleButton size="sm" />
              <PlayerControls size="sm" />
              <RepeatModeButton size="sm" />
            </div>
            <div className="w-full">
              <SeekBar
                positionSec={positionSec}
                durationSec={currentTrack?.durationSec ?? 0}
                onSeek={seek}
              />
            </div>
          </div>

          {/* Volume + queue */}
          <div className="flex w-1/4 items-center justify-end gap-4">
            <button
              onClick={() => setQueueOpen((v) => !v)}
              aria-label="Toggle queue"
              className={queueOpen ? "text-accent" : "text-text-secondary hover:text-text-primary"}
            >
              <ListMusic className="h-4 w-4" />
            </button>
            <VolumeControl />
          </div>
        </div>
      </div>
    </>
  );
}