import { albumApi } from '@/api';
import { ALBUM_QUERY_KEYS } from '@/constants';
import type { IAlbumListItem, IAlbumQueryParams } from '@/interfaces';
import type { IApiResponse, IPaginatedResponse } from '@/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IPaginatedResponse<IAlbumListItem>>, Error>,
    'queryKey'
  >;
}

export const useGetAlbumListQuery = (
  params?: IAlbumQueryParams,
  options?: IQueryOptions
) => {
  const { configs } = options || {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IPaginatedResponse<IAlbumListItem>>,
    Error
  >({
    queryKey: [ALBUM_QUERY_KEYS.GET_ALBUMS, params],
    queryFn: () => albumApi.list(params),
    ...configs,
  });

  return {
    data: data?.data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
