import { groupApi } from '@/api';
import { GROUP_QUERY_KEYS } from '@/constants';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  groupId: string;
  orderedIds: string[];
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<null>>;
};

export const useReorderGroupTracksMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      groupApi.reorderTracks(values.groupId, values.orderedIds),

    ...configs,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GROUP_QUERY_KEYS.GET_GROUP, variables.groupId],
      });
    },
  });
};
