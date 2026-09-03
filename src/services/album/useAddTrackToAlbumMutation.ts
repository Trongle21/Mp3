import { albumApi } from '@/api';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  albumId: string;
  trackId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<
    IVariablesType,
    IApiResponse<{ message?: string }>
  >;
};

export const useAddTrackToAlbumMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      albumApi.addTrack(values.albumId, values.trackId),

    ...configs,
  });
};
