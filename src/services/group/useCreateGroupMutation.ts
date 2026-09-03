import { groupApi } from '@/api';
import type { IGroupBody, IGroupResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  body: IGroupBody;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IGroupResponse>>;
};

export const useCreateGroupMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) => groupApi.create(values.body),

    ...configs,
  });
};
