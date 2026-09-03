import { playerApi } from '@/api';
import { PLAYER_QUERY_KEYS } from '@/constants';
import type { IPlayerStateResponse } from '@/interfaces';
import type { IApiResponse } from '@/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IPlayerStateResponse>, Error>,
    'queryKey'
  >;
}

export const useGetPlayerStateQuery = (options?: IQueryOptions) => {
  const { configs } = options || {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IPlayerStateResponse>,
    Error
  >({
    queryKey: [PLAYER_QUERY_KEYS.GET_PLAYER_STATE],
    queryFn: () => playerApi.getState(),
    ...configs,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
