import { trackApi } from '@/api';
import type { ITrackResponse } from '@/interfaces';
import type { IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  trackId: string;
  file: File;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, ITrackResponse>;
};

export const useUploadTrackCoverMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  return useMutation<ITrackResponse, Error, IVariablesType>({
    mutationFn: async (values: IVariablesType) => {
      const response = await trackApi.uploadCover(values.trackId, values.file);
      return response.data;
    },

    ...configs,
  });
};
