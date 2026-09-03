import { groupApi } from '@/api';
import type { IGroupBody, IGroupResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  groupId: string;
  body: IGroupBody;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IGroupResponse>>;
};

export const useUpdateGroupMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      groupApi.update(values.groupId, values.body),

    ...configs,
  });
};
