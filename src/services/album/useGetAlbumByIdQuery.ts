import { albumApi } from '@/api';
import { ALBUM_QUERY_KEYS } from '@/constants';
import type { IAlbumResponse } from '@/interfaces';
import type { IApiResponse } from '@/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IAlbumResponse>, Error>,
    'queryKey'
  >;
}

export const useGetAlbumByIdQuery = (
  albumId: string,
  options?: IQueryOptions
) => {
  const { configs } = options || {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IAlbumResponse>,
    Error
  >({
    queryKey: [ALBUM_QUERY_KEYS.GET_ALBUM, albumId],
    queryFn: () => albumApi.getById(albumId),
    ...configs,
  });

  return {
    data: data?.data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
