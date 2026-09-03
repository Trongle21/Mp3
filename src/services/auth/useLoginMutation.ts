import { authApi } from '@/api';
import type { ILoginBody, ILoginResponse } from '@/interfaces';
import type { IApiError, IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  body: ILoginBody;
};

type IMutationParams = {
  configs?: IAppMutationOptions<
    IVariablesType,
    IApiResponse<ILoginResponse>,
    IApiError
  >;
};

export const useLoginMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) => authApi.login(values.body),
    ...configs,
  });
};
