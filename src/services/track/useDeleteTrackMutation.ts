import { trackApi } from '@/api';
import { TRACK_QUERY_KEYS } from '@/constants';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  trackId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<{ id: string }>>;
};

export const useDeleteTrackMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) => trackApi.delete(values.trackId),

    ...configs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TRACK_QUERY_KEYS.GET_TRACKS],
      });
    },
  });
};
