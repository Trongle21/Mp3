"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListMusic } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlayerKeyboardShortcuts } from "@/hooks/usePlayerKeyboardShortcuts";
import { coverUrl } from "@/lib/utils";
import { SeekBar } from "./SeekBar";
import { VolumeControl } from "./VolumeControl";
import { QueuePanel } from "./QueuePanel";
import { PlayerControls } from "./PlayerControls";
import { ShuffleButton } from "./ShuffleButton";
import { RepeatModeButton } from "./RepeatModeButton";
import { CoverThumb } from "../shared/CoverThumb";

export function PlayerBar() {
  const { currentTrack, positionSec, seek } = usePlayer();
  const [queueOpen, setQueueOpen] = useState(false);

  usePlayerKeyboardShortcuts();

  return (
    <>
      <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />
      <div className="glass-player w-[60%] mx-auto fixed inset-x-0 bottom-0 z-20 flex h-player items-center justify-between border-t border-border px-4">
        {/* Track info */}
        <div className="flex w-1/4 min-w-0 items-center gap-3">
          {currentTrack ? (
            <>
              <Link href="/player" className="shrink-0">
                {currentTrack.coverKey ? (
                  <Image
                    src={coverUrl(currentTrack.coverKey)}
                    alt={currentTrack.title}
                    width={48}
                    height={48}
                    className="rounded"
                  />
                ) : (
                  <CoverThumb
                    coverKey={currentTrack.coverKey}
                    title={currentTrack.title}
                    size={40}
                    className="rounded"
                  />
                )}
              </Link>
              <div className="min-w-0">
                <p className="truncate text-body font-medium text-text-primary">
                  {currentTrack.title}
                </p>
                <p className="truncate text-caption text-text-secondary">
                  {currentTrack.artist}
                </p>
              </div>
            </>
          ) : (
            <p className="text-caption text-text-muted">Nothing playing</p>
          )}
        </div>

        {/* Controls + seek */}
        <div className="flex w-1/2 max-w-xl flex-col items-center gap-1">
          <div className="flex items-center gap-5">
            <ShuffleButton />
            <PlayerControls />
            <RepeatModeButton />
          </div>

          <div className="w-full">
            <SeekBar
              positionSec={positionSec}
              durationSec={currentTrack?.durationSec ?? 0}
              onSeek={seek}
            />
          </div>
        </div>

        <div className="flex w-1/4 items-center justify-end gap-4">
          <button
            onClick={() => setQueueOpen((v) => !v)}
            aria-label="Toggle queue"
            className={
              queueOpen
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }
          >
            <ListMusic className="h-4 w-4" />
          </button>
          <VolumeControl />
        </div>
      </div>
    </>
  );
}
