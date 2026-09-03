import { trackApi } from '@/api';
import { TRACK_QUERY_KEYS } from '@/constants';
import type { ITrack, ITrackResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  trackId: string;
  body: Partial<Pick<ITrack, 'title' | 'artist' | 'album'>>;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<ITrackResponse>>;
};

export const useUpdateTrackMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      trackApi.update(values.trackId, values.body),

    ...configs,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TRACK_QUERY_KEYS.GET_TRACKS],
      });
      queryClient.invalidateQueries({
        queryKey: [TRACK_QUERY_KEYS.GET_TRACK, variables.trackId],
      });
    },
  });
};
