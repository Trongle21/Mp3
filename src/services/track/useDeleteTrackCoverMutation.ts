import { trackApi } from '@/api';
import { TRACK_QUERY_KEYS } from '@/constants';
import type { ITrackResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  trackId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<ITrackResponse>>;
};

export const useDeleteTrackCoverMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      trackApi.deleteCover(values.trackId),

    ...configs,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TRACK_QUERY_KEYS.GET_TRACK, variables.trackId],
      });
    },
  });
};
