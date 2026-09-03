import { useCallback, useState } from 'react';

import type { IAddTracksToAlbumModalProps } from '@/components';
import { useDebounce } from '@/lib';
import { useAddTrackToAlbumMutation, useGetTrackListQuery } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { ALBUM_QUERY_KEYS } from '@/constants';
import { toast } from 'sonner';

export const useAddTrackToAlbumModal = (props: IAddTracksToAlbumModalProps) => {
  const { existingTrackIds, albumId } = props;

  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetTrackListQuery({
    search: debouncedSearch || undefined,
  });

  const { mutate: addTrackToAlbum } = useAddTrackToAlbumMutation({
    configs: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [ALBUM_QUERY_KEYS.GET_ALBUM, albumId],
        });
        toast.success('Track added to album');
      },
      onError: () => {
        toast.error('Failed to add track to album');
      },
    },
  });

  const tracks = (data?.data ?? []).filter(
    t => !existingTrackIds.includes(t._id)
  );

  const handleAddTrackToAlbum = useCallback(
    (trackId: string) => {
      const body = {
        albumId: albumId,
        trackId: trackId,
      };

      addTrackToAlbum(body);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [albumId]
  );

  return {
    tracks,
    isLoading,
    setSearch,
    search,
    handleAddTrackToAlbum,
  };
};
