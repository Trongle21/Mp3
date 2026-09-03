import { userApi } from '@/api';
import { USER_QUERY_KEYS } from '@/constants';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  userId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<{ _id: string }>>;
};

export const useDeleteUserMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) => userApi.delete(values.userId),

    ...configs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.GET_ALL_USERS],
      });
    },
  });
};
