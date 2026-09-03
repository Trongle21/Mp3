import type { IAlbumCardProps } from '@/components';

import { usePlayer } from '@/hooks/usePlayer';
import { useDeleteAlbumMutation, useGetTrackListQuery } from '@/services';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export const useAlbumCard = (props: IAlbumCardProps) => {
  const { album } = props;
  const { setQueue, play } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { mutate: deleteAlbum } = useDeleteAlbumMutation();

  const { data: allTracks } = useGetTrackListQuery();

  const handleDeleteAlbum = useCallback((id: string) => {
    deleteAlbum(
      { albumId: id },
      {
        onSuccess: () => {
          toast.success('Album deleted');
        },
        onError: () => {
          toast.error("Couldn't delete album");
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playAll = () => {
    if (!album.trackCount) {
      return;
    }
    const albumTracks =
      allTracks?.data.filter(t => t.album === album._id) ?? [];
    if (albumTracks.length === 0) {
      return;
    }
    setQueue(albumTracks);
    play(albumTracks[0]);
  };

  return {
    playAll,
    menuOpen,
    setMenuOpen,
    showDelete,
    setShowDelete,
    showEdit,
    setShowEdit,
    handleDeleteAlbum,
  };
};
