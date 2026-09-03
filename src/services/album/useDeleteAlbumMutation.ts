import { albumApi } from '@/api';
import { ALBUM_QUERY_KEYS } from '@/constants';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  albumId: string;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<{ id: string }>>;
};

export const useDeleteAlbumMutation = (mutationParams?: IMutationParams) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) => albumApi.delete(values.albumId),

    ...configs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ALBUM_QUERY_KEYS.GET_ALBUMS],
      });
    },
  });
};
