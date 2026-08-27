"use client";

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
import { formatDuration } from "@/lib/utils";
import { CoverThumb } from "@/components/shared/CoverThumb";

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
    <>
      {/* Mobile overlay: full-screen panel */}
      <div
        onClick={onClose}
        aria-hidden
        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
      />
      <div
        className="fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-border bg-bg-secondary pb-[calc(80px+env(safe-area-inset-bottom))] animate-fade-slide-in lg:w-80 lg:rounded-l-xl lg:pb-player lg:shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h3 className="text-h3 text-text-primary">Queue</h3>
          <button
            onClick={onClose}
            aria-label="Close queue"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-bg-highlight hover:text-text-primary"
          >
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
    </>
  );
}

function QueueRow({
  track,
  isActive,
  onPlay,
}: {
  track: { _id: string; title: string; artist: string; durationSec: number; coverUrl?: string };
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
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-muted active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button onClick={onPlay} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <CoverThumb src={track.coverUrl} title={track.title} size={36} className="rounded" />
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