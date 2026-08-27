"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Play, Plus, ListMusic } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useGroup, useReorderGroupTracks, useRemoveTrackFromGroup } from "@/hooks/useGroups";
import { usePlayer } from "@/hooks/usePlayer";
import { DraggableTrackRow } from "@/components/groups/DraggableTrackRow";
import { AddTracksModal } from "@/components/groups/AddTracksModal";
import { formatDuration } from "@/lib/utils";

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const groupId = params.id;
  const { data: group, isLoading } = useGroup(groupId);
  const { currentTrack, isPlaying, play, toggle, setQueue } = usePlayer();
  const reorder = useReorderGroupTracks(groupId);
  const removeTrack = useRemoveTrackFromGroup(groupId);
  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const orderedItems = useMemo(
    () => (group?.tracks ?? []).slice().sort((a, b) => a.position - b.position),
    [group]
  );

  const totalDuration = orderedItems.reduce((sum, item) => sum + item.track.durationSec, 0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedItems.findIndex((i) => i.track._id === active.id);
    const newIndex = orderedItems.findIndex((i) => i.track._id === over.id);
    const newOrder = arrayMove(orderedItems, oldIndex, newIndex);
    reorder.mutate(newOrder.map((i) => i.track._id));
  };

  const playAll = () => {
    const tracks = orderedItems.map((i) => i.track);
    if (tracks.length === 0) return;
    setQueue(tracks);
    play(tracks[0]);
  };

  const handlePlayTrack = (index: number) => {
    const tracks = orderedItems.map((i) => i.track);
    const track = tracks[index];
    if (currentTrack?._id === track._id) {
      toggle();
      return;
    }
    setQueue(tracks);
    play(track);
  };

  if (isLoading) {
    return (
      <div className="animate-fade-slide-in pt-4">
        <Skeleton className="h-40 w-full" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-6">
        <p className="text-caption uppercase tracking-wide text-text-muted">Group</p>
        <h1 className="text-h1">{group.name}</h1>
        <p className="mt-1 text-caption text-text-secondary">
          {group.trackCount} tracks · {formatDuration(totalDuration)}
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={playAll} disabled={orderedItems.length === 0}>
            <Play className="mr-2 h-4 w-4" />
            Play all
          </Button>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add tracks
          </Button>
        </div>
      </div>

      {orderedItems.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No tracks yet"
          description="Add tracks from your library to build this group."
          actionLabel="Add tracks"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedItems.map((i) => i.track._id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-[24px_32px_1fr_80px_32px] gap-3 border-b border-border px-3 pb-2 text-caption text-text-muted">
              <span />
              <span>#</span>
              <span>Title</span>
              <span>Duration</span>
              <span />
            </div>
            <div className="mt-1">
              {orderedItems.map((item, index) => (
                <DraggableTrackRow
                  key={item.track._id}
                  item={item}
                  index={index}
                  isActive={currentTrack?._id === item.track._id}
                  isPlaying={isPlaying}
                  onPlay={() => handlePlayTrack(index)}
                  onRemove={() => removeTrack.mutate(item.track._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddTracksModal
        open={addOpen}
        onOpenChange={setAddOpen}
        groupId={groupId}
        existingTrackIds={orderedItems.map((i) => i.track._id)}
      />
    </div>
  );
}
