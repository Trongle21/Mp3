"use client";

import { GripVertical, Play, Pause, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { GroupTrackItem } from "@/interfaces/group.interface";
import { formatDuration } from "@/lib/utils";
import { CoverThumb } from "@/components/shared/CoverThumb";

interface DraggableTrackRowProps {
  item: GroupTrackItem;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove: () => void;
}

export function DraggableTrackRow({
  item,
  index,
  isActive,
  isPlaying,
  onPlay,
  onRemove,
}: DraggableTrackRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.track._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group grid grid-cols-[24px_40px_1fr_80px_32px] items-center gap-3 rounded-md px-3 py-2 text-body transition-colors hover:bg-bg-elevated sm:gap-3 lg:grid-cols-[24px_32px_1fr_80px_32px]"
    >
      {/* Drag handle — hidden on mobile where touch-drag is hard */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="hidden cursor-grab text-text-muted opacity-0 transition-opacity active:cursor-grabbing sm:flex lg:opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        onClick={onPlay}
        aria-label={isActive && isPlaying ? "Pause" : "Play"}
        className="text-text-secondary"
      >
        <span className="group-hover:hidden">
          <span className={isActive ? "text-accent" : "text-text-muted"}>
            {index + 1}
          </span>
        </span>
        <span className="hidden group-hover:block text-text-primary">
          {isActive && isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </span>
      </button>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <CoverThumb
          trackId={item.track._id}
          title={item.track.title}
          size={40}
          className="rounded"
        />
        <div className="min-w-0">
          <p
            className={`truncate font-medium ${isActive ? "text-accent" : "text-text-primary"}`}
          >
            {item.track.title}
          </p>
          <p className="truncate text-caption text-text-secondary">
            {item.track.artist}
          </p>
        </div>
      </div>

      <p className="hidden text-caption text-text-secondary sm:block">
        {formatDuration(item.track.durationSec)}
      </p>

      {/* Remove: hidden on mobile, long-press on mobile would be alternative */}
      <button
        onClick={onRemove}
        aria-label="Remove from group"
        className="hidden h-6 w-6 items-center justify-center text-text-muted opacity-0 transition-opacity hover:text-danger group-hover:flex group-hover:opacity-100 lg:flex"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
