'use client';

import { AddTracksModal } from '@/components/groups/AddTracksModal';
import { DraggableTrackRow } from '@/components/groups/DraggableTrackRow';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroupDetail } from '@/hooks';
import { formatDuration } from '@/lib/utils';
import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ListMusic, Play, Plus } from 'lucide-react';

export default function GroupDetailPage() {
  const {
    isLoading,
    sensors,
    orderedItems,
    totalDuration,
    handleDragEnd,
    playAll,
    handlePlayTrack,
    addOpen,
    setAddOpen,
    group,
    currentTrack,
    isPlaying,
    handleRemoveTrack,
  } = useGroupDetail();

  if (!group) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="animate-fade-slide-in pt-4">
        <Skeleton className="h-40 w-full" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-14 w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-6">
        <p className="text-caption uppercase tracking-wide text-text-muted">
          Group
        </p>
        <h1 className="text-h1">{group.name}</h1>
        <p className="mt-1 text-caption text-text-secondary">
          {group.trackCount} tracks · {formatDuration(totalDuration)}
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            onClick={playAll}
            disabled={orderedItems.length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            Play all
          </Button>
          <Button
            variant="outline"
            onClick={() => setAddOpen(true)}
          >
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedItems.map(i => i.track._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="hidden grid-cols-[24px_32px_1fr_80px_32px] gap-3 border-b border-border px-3 pb-2 text-caption text-text-muted lg:grid">
              <span />
              <span>#</span>
              <span>Title</span>
              <span>Duration</span>
              <span />
            </div>
            <div className="mb-1 px-3 pb-1 text-caption text-text-muted sm:hidden">
              <span>#</span>
            </div>
            {orderedItems.map((item, index) => (
              <DraggableTrackRow
                key={item.track._id}
                item={item}
                index={index}
                isActive={currentTrack?._id === item.track._id}
                isPlaying={isPlaying}
                onPlay={() => handlePlayTrack(index)}
                onRemove={() => handleRemoveTrack(item.track._id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <AddTracksModal
        open={addOpen}
        onOpenChange={setAddOpen}
        groupId={group._id}
        existingTrackIds={orderedItems.map(i => i.track._id)}
      />
    </div>
  );
}
