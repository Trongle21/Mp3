import { groupApi } from '@/api';
import { GROUP_QUERY_KEYS } from '@/constants';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  groupId: string;
  trackId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<
    IVariablesType,
    IApiResponse<{ position: number; message?: string }>
  >;
};

export const useAddTrackToGroupMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      groupApi.addTrack(values.groupId, values.trackId),

    ...configs,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GROUP_QUERY_KEYS.GET_GROUP, variables.groupId],
      });
    },
  });
};
