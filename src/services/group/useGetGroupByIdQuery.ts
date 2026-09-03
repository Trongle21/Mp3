import { groupApi } from '@/api';
import { GROUP_QUERY_KEYS } from '@/constants';
import type { IGroupResponse } from '@/interfaces';
import type { IApiResponse } from '@/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IGroupResponse>, Error>,
    'queryKey'
  >;
}

export const useGetGroupByIdQuery = (
  groupId: string,
  options?: IQueryOptions
) => {
  const { configs } = options || {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IGroupResponse>,
    Error
  >({
    queryKey: [GROUP_QUERY_KEYS.GET_GROUP, groupId],
    queryFn: () => groupApi.getById(groupId),
    ...configs,
  });

  return {
    data: data?.data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
