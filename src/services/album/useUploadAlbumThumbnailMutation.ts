import { albumApi } from '@/api';
import type { IAlbumResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  albumId: string;
  file: File;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IAlbumResponse>>;
};

export const useUploadAlbumThumbnailMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      albumApi.uploadThumbnail(values.albumId, values.file),

    ...configs,
  });
};
