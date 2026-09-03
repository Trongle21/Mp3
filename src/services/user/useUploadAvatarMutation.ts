import { userApi } from '@/api';
import { USER_QUERY_KEYS } from '@/constants';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  file: File;
};

type IMutationParams = {
  configs?: IAppMutationOptions<
    IVariablesType,
    IApiResponse<{ avatarUrl: string }>
  >;
};

export const useUploadAvatarMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) => userApi.uploadAvatar(values.file),

    ...configs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.GET_ME],
      });
    },
  });
};
