import { useCallback, useState } from 'react';

import { useDebounce } from '@/lib';
import { useAddTrackToGroupMutation, useGetTrackListQuery } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { GROUP_QUERY_KEYS } from '@/constants';
import { toast } from 'sonner';
import type { IAddTracksToGroupModalProps } from '@/components';

export const useAddTracksToGroupModal = (
  props: IAddTracksToGroupModalProps
) => {
  const { existingTrackIds, groupId } = props;

  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetTrackListQuery({
    search: debouncedSearch || undefined,
  });

  const { mutate: addTrackToGroup } = useAddTrackToGroupMutation({
    configs: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [GROUP_QUERY_KEYS.GET_GROUP, groupId],
        });
        toast.success('Track added to group');
      },
      onError: () => {
        toast.error('Failed to add track to group');
      },
    },
  });

  const tracks = (data?.data ?? []).filter(
    t => !existingTrackIds.includes(t._id)
  );

  const handleAddTrackToGroup = useCallback(
    (trackId: string) => {
      addTrackToGroup({
        groupId,
        trackId,
      });
    },
    [addTrackToGroup, groupId]
  );

  return {
    tracks,
    isLoading,
    setSearch,
    search,
    handleAddTrackToGroup,
  };
};
