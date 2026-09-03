import { usePlayer } from '@/hooks/usePlayer';
import {
  useGetAlbumByIdQuery,
  useRemoveTrackFromAlbumMutation,
  useReorderAlbumTracksMutation,
} from '@/services';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export const useAlbumDetail = () => {
  const params = useParams<{ id: string }>();

  const albumId = params.id;

  const { currentTrack, isPlaying, play, toggle, setQueue } = usePlayer();

  const { data: album, isLoading } = useGetAlbumByIdQuery(albumId);

  const { mutate: reorder } = useReorderAlbumTracksMutation();

  const { mutate: removeTrack } = useRemoveTrackFromAlbumMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const orderedItems = useMemo(
    () => (album?.tracks ?? []).slice().sort((a, b) => a.position - b.position),
    [album]
  );

  const totalDuration = useMemo(() => {
    return orderedItems.reduce((sum, item) => sum + item.track.durationSec, 0);
  }, [orderedItems]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }
      const oldIndex = orderedItems.findIndex(i => i.track._id === active.id);
      const newIndex = orderedItems.findIndex(i => i.track._id === over.id);
      const newOrder = arrayMove(orderedItems, oldIndex, newIndex);

      const trackIds = newOrder.map(i => i.track._id);

      const body = {
        albumId: albumId,
        trackIds: trackIds,
      };

      reorder(body);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [albumId, orderedItems]
  );

  const playAll = useCallback(() => {
    const tracks = orderedItems.map(i => i.track);
    if (tracks.length === 0) {
      return;
    }
    setQueue(tracks);
    play(tracks[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedItems]);

  const handlePlayTrack = useCallback(
    (index: number) => {
      const tracks = orderedItems.map(i => i.track);
      const track = tracks[index];
      if (currentTrack?._id === track._id) {
        toggle();
        return;
      }
      setQueue(tracks);
      play(track);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTrack, orderedItems]
  );

  const handleRemoveTrack = useCallback(
    (trackId: string) => {
      removeTrack({ albumId, trackId });
    },
    [albumId, removeTrack]
  );

  return {
    albumId,
    isLoading,
    sensors,
    orderedItems,
    totalDuration,
    handleDragEnd,
    playAll,
    handlePlayTrack,
    addOpen,
    setAddOpen,
    showEdit,
    setShowEdit,
    album,
    currentTrack,
    isPlaying,
    play,
    toggle,
    setQueue,
    reorder,
    handleRemoveTrack,
  };
};
