import { userApi } from '@/api';
import { USER_QUERY_KEYS } from '@/constants';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = void;

type IMutationParams = {
  configs?: IAppMutationOptions<
    IVariablesType,
    IApiResponse<{ avatarUrl: null }>
  >;
};

export const useDeleteAvatarMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteAvatar(),

    ...configs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.GET_ME],
      });
    },
  });
};
