import { usePlayer } from '@/hooks';
import {
  useGetGroupByIdQuery,
  useRemoveTrackFromGroupMutation,
  useReorderGroupTracksMutation,
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

export const useGroupDetail = () => {
  const params = useParams<{ id: string }>();

  const groupId = params.id;

  const { currentTrack, isPlaying, play, toggle, setQueue } = usePlayer();

  const { data: group, isLoading } = useGetGroupByIdQuery(groupId);

  const { mutate: reorder } = useReorderGroupTracksMutation();

  const { mutate: removeTrack } = useRemoveTrackFromGroupMutation();

  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const orderedItems = useMemo(
    () => (group?.tracks ?? []).slice().sort((a, b) => a.position - b.position),
    [group]
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

      const orderedIds = newOrder.map(i => i.track._id);

      reorder({ groupId, orderedIds });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupId, orderedItems]
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
      removeTrack({ groupId, trackId });
    },
    [groupId, removeTrack]
  );

  return {
    groupId,
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
  };
};
