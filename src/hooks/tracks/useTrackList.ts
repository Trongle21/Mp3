import type { ITrackListProps } from '@/components';
import { usePlayer } from '@/hooks/usePlayer';
import type { ITrack } from '@/interfaces/track.interface';
import { useState } from 'react';

export const useTrackList = (props: ITrackListProps) => {
  const { tracks } = props;
  const { currentTrack, isPlaying, play, toggle, setQueue } = usePlayer();
  const [menuFor, setMenuFor] = useState<{
    track: ITrack;
    x: number;
    y: number;
  } | null>(null);
  const [editTrack, setEditTrack] = useState<ITrack | null>(null);

  const handlePlay = (track: ITrack) => {
    if (currentTrack?._id === track._id) {
      toggle();
      return;
    }
    setQueue(tracks);
    play(track);
  };

  const openMenu = (track: ITrack, e: React.MouseEvent) => {
    e.preventDefault();
    setMenuFor({ track, x: e.clientX, y: e.clientY });
  };

  return {
    handlePlay,
    openMenu,
    menuFor,
    editTrack,
    setEditTrack,
    isPlaying,
    currentTrack,
    setMenuFor,
  };
};
