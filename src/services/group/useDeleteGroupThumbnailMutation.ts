import { groupApi } from '@/api';
import { GROUP_QUERY_KEYS } from '@/constants';
import type { IGroupResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  groupId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IGroupResponse>>;
};

export const useDeleteGroupThumbnailMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      groupApi.deleteThumbnail(values.groupId),

    ...configs,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GROUP_QUERY_KEYS.GET_GROUP, variables.groupId],
      });
    },
  });
};
