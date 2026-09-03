import type { IApiResponse } from './../../types/api-response';
import { albumApi } from '@/api';
import { ALBUM_QUERY_KEYS } from '@/constants';
import type { IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  albumId: string;
  trackIds: string[];
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<null>>;
};

export const useReorderAlbumTracksMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      albumApi.reorderTracks(values.albumId, values.trackIds),

    ...configs,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ALBUM_QUERY_KEYS.GET_ALBUM, variables.albumId],
      });
    },
  });
};
