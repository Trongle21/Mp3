import type { ITrackContextMenuProps } from '@/components';
import { ALBUM_QUERY_KEYS, TRACK_QUERY_KEYS } from '@/constants';
import { useAuth } from '@/hooks';
import type { ITrack } from '@/interfaces';
import {
  useAddTrackToAlbumMutation,
  useAddTrackToGroupMutation,
  useDeleteTrackMutation,
  useGetAlbumListQuery,
  useGetGroupListQuery,
  useRemoveTrackFromAlbumMutation,
} from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const useTrackContextMenu = (props: ITrackContextMenuProps) => {
  const { onClose, x, y } = props;
  const ref = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const [showGroups, setShowGroups] = useState(false);
  const [showAlbums, setShowAlbums] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.isAdmin === 'master' || user?.isAdmin === 'normal';

  const { data: groups } = useGetGroupListQuery();

  const { data: albums } = useGetAlbumListQuery();

  const { mutate: deleteTrack, isPending: isDeleting } = useDeleteTrackMutation(
    {
      configs: {
        onSuccess: () => {
          toast.success('Track deleted');
          //   queryClient.invalidateQueries({
          //     queryKey: [TRACK_QUERY_KEYS.GET_TRACK],
          //   });
        },
        onError: () => {
          toast.error('Failed to delete track');
        },
      },
    }
  );

  const { mutate: removeTrackFromGroup } = useRemoveTrackFromAlbumMutation({
    configs: {
      onSuccess: () => {
        toast.success('Track removed from group');

        queryClient.invalidateQueries({
          queryKey: [ALBUM_QUERY_KEYS.GET_ALBUM],
        });
      },
      onError: () => {
        toast.error('Failed to remove track from group');
      },
    },
  });

  const { mutate: addTrackToAlbum } = useAddTrackToAlbumMutation({
    configs: {
      onSuccess: () => {
        toast.success('Track added to album');

        queryClient.invalidateQueries({
          queryKey: [TRACK_QUERY_KEYS.GET_TRACK],
        });
      },
    },
  });

  const { mutate: addTrackToGroup } = useAddTrackToGroupMutation({
    configs: {
      onSuccess: () => {
        toast.success('Track added to group');
        onClose();
      },
      onError: () => {
        toast.error('Failed to add track to group');
      },
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showDelete) {
        return;
      }
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, showDelete]);

  const menuStyle = {
    top: Math.min(y, window.innerHeight - 280),
    left: Math.min(x, window.innerWidth - 220),
  };

  const handleRemoveTrackFromGroup = useCallback((track: ITrack) => {
    removeTrackFromGroup({
      albumId: track.album,
      trackId: track._id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteTrack = useCallback((track: ITrack) => {
    deleteTrack({
      trackId: track._id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTrackToAlbum = useCallback(
    (albumId: string, trackId: string) => {
      addTrackToAlbum({
        albumId,
        trackId,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleAddTrackToGroup = useCallback(
    (groupId: string, trackId: string) => {
      addTrackToGroup({
        groupId,
        trackId,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    ref,
    showGroups,
    showAlbums,
    showDelete,
    menuStyle,
    isAdmin,
    groups,
    albums,
    deleteTrack,
    setShowGroups,
    setShowAlbums,
    setShowDelete,
    removeTrackFromGroup,
    handleRemoveTrackFromGroup,
    isDeleting,
    handleDeleteTrack,
    addTrackToAlbum,
    handleAddTrackToAlbum,
    handleAddTrackToGroup,
  };
};
