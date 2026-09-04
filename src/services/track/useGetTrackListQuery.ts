import { trackApi } from '@/api';
import { TRACK_QUERY_KEYS } from '@/constants';
import type { ITrack, ITrackQueryParams } from '@/interfaces';
import type { IApiResponse, IPaginatedResponse } from '@/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IPaginatedResponse<ITrack>>, Error>,
    'queryKey'
  >;
}

export const useGetTrackListQuery = (
  params?: ITrackQueryParams,
  options?: IQueryOptions
) => {
  const { configs } = options || {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IPaginatedResponse<ITrack>>,
    Error
  >({
    queryKey: [TRACK_QUERY_KEYS.GET_TRACKS, params],
    queryFn: () => trackApi.list(params),
    ...configs,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
