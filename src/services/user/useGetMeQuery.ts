import { userApi } from '@/api';
import { USER_QUERY_KEYS } from '@/constants';
import type { IUserResponse } from '@/interfaces';
import type { IApiResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useGetMeQuery = () => {
  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IUserResponse>,
    Error
  >({
    queryKey: [USER_QUERY_KEYS.GET_ME],
    queryFn: () => userApi.getMe(),
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    isFetching,
  };
};
