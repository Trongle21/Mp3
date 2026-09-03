import { trackApi } from '@/api';
import type { ITrackResponse } from '@/interfaces';
import type { IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  formData: FormData;
  onUploadProgress?: (percent: number) => void;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, ITrackResponse>;
};

export const useUploadTrackMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  return useMutation<ITrackResponse, Error, IVariablesType>({
    mutationFn: async (values: IVariablesType) => {
      const response = await trackApi.upload(
        values.formData,
        values.onUploadProgress
      );
      return response.data;
    },

    ...configs,
  });
};
