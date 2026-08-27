"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Play, Plus, Disc } from "lucide-react";
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
import { CoverThumb } from "@/components/shared/CoverThumb";
import {
  useAlbum,
  useReorderAlbumTracks,
  useRemoveTrackFromAlbum,
} from "@/hooks/useAlbums";
import { usePlayer } from "@/hooks/usePlayer";
import { formatDuration } from "@/lib/utils";
import { AddTracksToAlbumModal } from "@/components/albums/AddTracksToAlbumModal";
import { EditAlbumDialog } from "@/components/albums/EditAlbumDialog";
import type { AlbumListItem } from "@/interfaces/album.interface";

export default function AlbumDetailPage() {
  const params = useParams<{ id: string }>();
  const albumId = params.id;
  const { data: album, isLoading } = useAlbum(albumId);
  const { currentTrack, isPlaying, play, toggle, setQueue } = usePlayer();
  const reorder = useReorderAlbumTracks(albumId);
  const removeTrack = useRemoveTrackFromAlbum(albumId);
  const [addOpen, setAddOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const orderedItems = useMemo(
    () => (album?.tracks ?? []).slice().sort((a, b) => a.position - b.position),
    [album]
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

  if (!album) return null;

  const listItem: AlbumListItem = {
    _id: album._id,
    title: album.title,
    artist: album.artist,
    description: album.description,
    year: album.year,
    genre: album.genre,
    thumbnailUrl: album.thumbnailUrl,
    trackCount: album.trackCount,
    totalDuration,
    createdAt: album.createdAt,
  };

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-6 flex gap-6">
        <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-md bg-bg-highlight shadow-lg">
          {album.thumbnailUrl ? (
            <Image
              src={album.thumbnailUrl}
              alt={album.title}
              fill
              className="object-cover"
              sizes="176px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Disc className="h-16 w-16 text-text-secondary" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-caption uppercase tracking-wide text-text-muted">Album</p>
          <h1 className="text-h1">{album.title}</h1>
          <p className="mt-1 text-body text-text-secondary">
            {album.artist || "Unknown Artist"}
          </p>
          <p className="text-caption text-text-muted">
            {album.year && `${album.year} · `}
            {album.genre && `${album.genre} · `}
            {album.trackCount} tracks · {formatDuration(totalDuration)}
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
            <Button variant="ghost" onClick={() => setShowEdit(true)}>
              Edit album
            </Button>
          </div>
        </div>
      </div>

      {orderedItems.length === 0 ? (
        <EmptyState
          icon={Disc}
          title="No tracks yet"
          description="Add tracks from your library to build this album."
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
            items={orderedItems.map((i) => i.track._id)}
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
              <AlbumTrackRow
                key={item.track._id}
                item={item}
                index={index}
                isActive={currentTrack?._id === item.track._id}
                isPlaying={isPlaying}
                onPlay={() => handlePlayTrack(index)}
                onRemove={() => removeTrack.mutate(item.track._id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <AddTracksToAlbumModal
        open={addOpen}
        onOpenChange={setAddOpen}
        albumId={albumId}
        existingTrackIds={orderedItems.map((i) => i.track._id)}
      />

      <EditAlbumDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        album={listItem}
      />
    </div>
  );
}

interface AlbumTrackRowProps {
  item: import("@/interfaces/album.interface").AlbumTrackItem;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove: () => void;
}

function AlbumTrackRow({ item, index, isActive, isPlaying, onPlay, onRemove }: AlbumTrackRowProps) {
  return (
    <div
      className="group grid grid-cols-[24px_40px_1fr_80px_32px] items-center gap-3 rounded-md px-3 py-2 text-body transition-colors hover:bg-bg-elevated sm:gap-3 lg:grid-cols-[24px_32px_1fr_80px_32px]"
    >
      <div />
      <button onClick={onPlay} aria-label={isActive && isPlaying ? "Pause" : "Play"} className="text-text-secondary">
        <span className="group-hover:hidden">
          <span className={isActive ? "text-accent" : "text-text-muted"}>{index + 1}</span>
        </span>
        <span className="hidden group-hover:block text-text-primary">
          {isActive && isPlaying ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <Play className="h-4 w-4" />
          )}
        </span>
      </button>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <CoverThumb src={item.track.coverUrl} title={item.track.title} size={40} className="rounded" />
        <div className="min-w-0">
          <p className={`truncate font-medium ${isActive ? "text-accent" : "text-text-primary"}`}>
            {item.track.title}
          </p>
          <p className="truncate text-caption text-text-secondary">{item.track.artist}</p>
        </div>
      </div>

      <p className="hidden text-caption text-text-secondary sm:block">{formatDuration(item.track.durationSec)}</p>

      <button
        onClick={onRemove}
        aria-label="Remove from album"
        className="hidden h-6 w-6 items-center justify-center text-text-muted opacity-0 transition-opacity hover:text-danger group-hover:flex group-hover:opacity-100 lg:flex"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
