import { authApi } from '@/api';
import type { IRefreshResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  refreshToken: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IRefreshResponse>>;
};

export const useRefreshMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      authApi.refresh(values.refreshToken),

    ...configs,
  });
};
