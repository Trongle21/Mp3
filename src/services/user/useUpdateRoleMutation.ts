import { userApi } from '@/api';
import type { IUpdateRoleBody, IUserResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  userId: string;
  body: IUpdateRoleBody;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IUserResponse>>;
};

export const useUpdateRoleMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      userApi.updateRole(values.userId, values.body),

    ...configs,
  });
};
