import { trackApi } from '@/api';
import { TRACK_QUERY_KEYS } from '@/constants';
import type { ITrackResponse } from '@/interfaces';
import type { IApiResponse } from '@/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<ITrackResponse>, Error>,
    'queryKey'
  >;
}

export const useGetTrackByIdQuery = (
  trackId: string,
  options?: IQueryOptions
) => {
  const { configs } = options || {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<ITrackResponse>,
    Error
  >({
    queryKey: [TRACK_QUERY_KEYS.GET_TRACK, trackId],
    queryFn: () => trackApi.getById(trackId),
    ...configs,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
