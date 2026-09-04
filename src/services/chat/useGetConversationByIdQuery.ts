import { conversationApi } from '@/api';
import { CHAT_QUERY_KEYS } from '@/constants';
import type {
  Conversation,
  IConversationResponse,
} from '@/interfaces';
import type { IApiResponse } from '@/types';
import {
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

interface IQueryOptions {
  configs?: Omit<
    UseQueryOptions<IApiResponse<IConversationResponse>, Error>,
    'queryKey' | 'queryFn'
  >;
}

export const useGetConversationByIdQuery = (
  conversationId: string,
  options?: IQueryOptions
) => {
  const { configs } = options ?? {};

  const { data, isLoading, isError, isFetching, refetch } = useQuery<
    IApiResponse<IConversationResponse>,
    Error
  >({
    queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATION, conversationId],
    queryFn: () => conversationApi.getById(conversationId),
    enabled: !!conversationId,
    ...configs,
  });

  return {
    data: data?.data?.data as Conversation | undefined,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
};
