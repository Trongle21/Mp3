import { albumApi } from '@/api';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  albumId: string;
  trackId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<null>>;
};

export const useRemoveTrackFromAlbumMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      albumApi.removeTrack(values.albumId, values.trackId),

    ...configs,
  });
};
