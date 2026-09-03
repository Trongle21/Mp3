import { groupApi } from '@/api';
import { GROUP_QUERY_KEYS } from '@/constants';
import type {
  IGroup,
  IGroupQueryParams,
  IGroupResponse,
} from '@/interfaces';
import type { IApiResponse, IPaginatedResponse } from '@/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IPaginatedResponse<IGroup>>, Error>,
    'queryKey'
  >;
}

export const useGetGroupListQuery = (
  params?: IGroupQueryParams,
  options?: IQueryOptions
) => {
  const { configs } = options || {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IPaginatedResponse<IGroup>>,
    Error
  >({
    queryKey: [GROUP_QUERY_KEYS.GET_GROUPS, params],
    queryFn: () => groupApi.list(params),
    ...configs,
  });

  return {
    data: data?.data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
