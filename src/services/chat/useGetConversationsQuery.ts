import { conversationApi } from '@/api';
import { CHAT_QUERY_KEYS } from '@/constants';
import type {
  Conversation,
  IConversationResponse,
  IPaginatedConversations,
} from '@/interfaces';
import type { IApiResponse } from '@/types';
import {
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IPaginatedConversations>, Error>,
    'queryKey' | 'queryFn'
  > & { queryFn?: () => Promise<IApiResponse<IPaginatedConversations>> };
}

export const useGetConversationsQuery = (
  options?: IQueryOptions & { params?: { page?: number; limit?: number } }
) => {
  const { configs, params } = options ?? {};
  const { data, isLoading, isError, isFetching, refetch } = useQuery<
    IApiResponse<IPaginatedConversations>,
    Error
  >({
    queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATIONS, params],
    queryFn: () => conversationApi.list(params),
    ...configs,
  });

  return {
    data: data?.data?.data as Conversation[] | undefined,
    pagination: data?.data?.pagination,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
};
