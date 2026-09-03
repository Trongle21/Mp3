import { userApi } from '@/api';
import { USER_QUERY_KEYS } from '@/constants';
import type { IUpdateUserBody, IUserResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  userId: string;
  body: IUpdateUserBody;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IUserResponse>>;
};

export const useUpdateUserMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      userApi.update(values.userId, values.body),

    ...configs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.GET_ALL_USERS],
      });
    },
  });
};
