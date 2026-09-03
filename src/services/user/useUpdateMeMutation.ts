import { userApi } from '@/api';
import { USER_QUERY_KEYS } from '@/constants';
import type { IUpdateMeBody, IUserResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  body: IUpdateMeBody;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IUserResponse>>;
};

export const useUpdateMeMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) => userApi.updateMe(values.body),

    ...configs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEYS.GET_ME],
      });
    },
  });
};
