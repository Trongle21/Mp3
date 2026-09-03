import { authApi } from '@/api';
import type { IRegisterBody, IRegisterResponse } from '@/interfaces';
import type { IApiError, IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  body: IRegisterBody;
};

type IMutationParams = {
  configs?: IAppMutationOptions<
    IVariablesType,
    IApiResponse<IRegisterResponse>
  >;
};

export const useRegisterMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  return useMutation<
    IApiResponse<IRegisterResponse>,
    IApiError,
    IVariablesType
  >({
    mutationFn: (values: IVariablesType) => authApi.register(values.body),

    ...configs,
  });
};
