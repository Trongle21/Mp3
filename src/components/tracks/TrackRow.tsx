"use client";

import type { Track } from "@/interfaces/track.interface";
import { formatDuration } from "@/lib/utils";
import { MoreHorizontal, Pause, Play } from "lucide-react";
import { CoverThumb } from "../shared/CoverThumb";

interface TrackRowProps {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onOpenMenu: (e: React.MouseEvent) => void;
}

export function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  onPlay,
  onOpenMenu,
}: TrackRowProps) {
  return (
    <div
      onDoubleClick={onPlay}
      className="group grid grid-cols-[32px_1fr_1fr_80px_32px] items-center gap-4 rounded-md px-3 py-2 text-body transition-colors hover:bg-bg-elevated"
    >
      <button
        onClick={onPlay}
        aria-label={isActive && isPlaying ? "Pause" : "Play"}
        className="flex h-6 w-6 items-center justify-center text-text-secondary"
      >
        <span className="group-hover:hidden">
          {isActive && isPlaying ? (
            <span className="text-accent">▶</span>
          ) : (
            <span className={isActive ? "text-accent" : "text-text-muted"}>
              {index + 1}
            </span>
          )}
        </span>
        <span className="hidden group-hover:block text-text-primary">
          {isActive && isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </span>
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <CoverThumb
          coverKey={track.coverKey}
          title={track.title}
          size={40}
          className="rounded"
        />
        <div className="min-w-0">
          <p
            className={`truncate font-medium ${isActive ? "text-accent" : "text-text-primary"}`}
          >
            {track.title}
          </p>
          <p className="truncate text-caption text-text-secondary">
            {track.artist}
          </p>
        </div>
      </div>

      <p className="truncate text-caption text-text-secondary">{track.album}</p>
      <p className="text-caption text-text-secondary">
        {formatDuration(track.durationSec)}
      </p>

      <button
        onClick={onOpenMenu}
        aria-label="More options"
        className="flex h-6 w-6 items-center justify-center text-text-muted opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
