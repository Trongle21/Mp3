"use client";

import Image from "next/image";
import { X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePlayer } from "@/hooks/usePlayer";
import { coverUrl, formatDuration } from "@/lib/utils";

interface QueuePanelProps {
  open: boolean;
  onClose: () => void;
}

export function QueuePanel({ open, onClose }: QueuePanelProps) {
  const { queue, currentTrack, play, reorderQueue } = usePlayer();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = queue.findIndex((t) => t._id === active.id);
    const newIndex = queue.findIndex((t) => t._id === over.id);
    reorderQueue(oldIndex, newIndex);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-30 flex w-80 flex-col border-l border-border bg-bg-secondary pb-player animate-fade-slide-in">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <h3 className="text-h3 text-text-primary">Queue</h3>
        <button onClick={onClose} aria-label="Close queue" className="text-text-muted hover:text-text-primary">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {queue.length === 0 ? (
          <p className="px-2 py-6 text-center text-caption text-text-muted">Queue is empty</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={queue.map((t) => t._id)} strategy={verticalListSortingStrategy}>
              {queue.map((track) => (
                <QueueRow
                  key={track._id}
                  track={track}
                  isActive={currentTrack?._id === track._id}
                  onPlay={() => play(track)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function QueueRow({
  track,
  isActive,
  onPlay,
}: {
  track: { _id: string; title: string; artist: string; durationSec: number; coverKey: string };
  isActive: boolean;
  onPlay: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track._id,
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
      className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-bg-elevated"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-text-muted active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <button onClick={onPlay} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        {track.coverKey ? (
          <Image src={coverUrl(track.coverKey)} alt="" width={36} height={36} className="rounded" />
        ) : (
          <div className="h-9 w-9 shrink-0 rounded bg-bg-highlight" />
        )}
        <div className="min-w-0">
          <p className={`truncate text-caption font-medium ${isActive ? "text-accent" : "text-text-primary"}`}>
            {track.title}
          </p>
          <p className="truncate text-caption text-text-muted">{track.artist}</p>
        </div>
      </button>
      <span className="text-caption text-text-muted">{formatDuration(track.durationSec)}</span>
    </div>
  );
}
