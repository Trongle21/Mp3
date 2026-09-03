import { albumApi } from '@/api';
import type { IAlbumBody, IAlbumResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  albumId: string;
  body: IAlbumBody;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IAlbumResponse>>;
};

export const useUpdateAlbumMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      albumApi.update(values.albumId, values.body),

    ...configs,
  });
};
