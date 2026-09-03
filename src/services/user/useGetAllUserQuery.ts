import { userApi } from '@/api';
import { USER_QUERY_KEYS } from '@/constants';
import type { IUserListResponse } from '@/interfaces';
import type { IApiResponse } from '@/types';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IUserListResponse>, Error>,
    'queryKey'
  >;
}

export const useGetAllUserQuery = (options: IQueryOptions) => {
  const { configs } = options;

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IUserListResponse>,
    Error
  >({
    queryKey: [USER_QUERY_KEYS.GET_ALL_USERS],
    queryFn: () => userApi.getAll(),
    ...configs,
  });

  return {
    data: data?.data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
