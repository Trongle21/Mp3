import { albumApi } from '@/api';
import { ALBUM_QUERY_KEYS } from '@/constants';
import type { IAlbumResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  albumId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IAlbumResponse>>;
};

export const useDeleteAlbumThumbnailMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      albumApi.deleteThumbnail(values.albumId),

    ...configs,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ALBUM_QUERY_KEYS.GET_ALBUM, variables.albumId],
      });
    },
  });
};
