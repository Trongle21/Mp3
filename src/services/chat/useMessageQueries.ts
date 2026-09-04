import { messageApi } from '@/api';
import { CHAT_QUERY_KEYS } from '@/constants';
import type {
  IMessageListResponse,
  Message,
  SendMessageBody,
} from '@/interfaces';
import type {
  ChatMessageQueryParams,
  IApiResponse,
  IAppMutationOptions,
} from '@/types';
import {
  type InfiniteData,
  type UseMutationOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

interface IUseMessagesOptions {
  conversationId: string;
  limit?: number;
}

type MessagesInfinite = InfiniteData<IApiResponse<IMessageListResponse>>;
type MessagesQueryKey = readonly [string, string, { limit: number }];

/**
 * Cursor-paginated message history.
 *
 * The API returns messages in ascending time order (oldest first), so:
 *  - `pages` are accumulated with each fetch
 *  - When the user scrolls to the top, we pass `before=<oldestId>`
 *  - `hasNextPage` is true while `pagination.nextBefore` is set
 */
export const useGetMessagesInfiniteQuery = (options: IUseMessagesOptions) => {
  const { conversationId, limit = 30 } = options;

  const result = useInfiniteQuery<
    IApiResponse<IMessageListResponse>,
    Error,
    MessagesInfinite,
    MessagesQueryKey,
    string | undefined
  >({
    queryKey: [CHAT_QUERY_KEYS.GET_MESSAGES, conversationId, { limit }],
    queryFn: ({ pageParam }) => {
      const params: ChatMessageQueryParams = {
        limit,
        before: pageParam ?? undefined,
      };
      return messageApi.list(conversationId, params);
    },
    initialPageParam: undefined,
    getNextPageParam: lastPage => {
      const next = lastPage?.data?.pagination?.nextBefore;
      return next ?? undefined;
    },
    enabled: !!conversationId,
  });

  return {
    ...result,
    /** Flattened, oldest-first list of all loaded messages. */
    messages:
      result.data?.pages.flatMap(p => p.data?.data ?? []) ?? ([] as Message[]),
  };
};

export const useGetMessageByIdQuery = (
  conversationId: string,
  messageId: string | null
) =>
  useQuery({
    queryKey: [CHAT_QUERY_KEYS.GET_MESSAGE_BY_ID, conversationId, messageId],
    queryFn: () =>
      messageId ? messageApi.getById(conversationId, messageId) : null,
    enabled: !!conversationId && !!messageId,
  });

type SendVars = { conversationId: string; body: SendMessageBody };

export const useSendMessageMutation = (
  configs?: IAppMutationOptions<SendVars, IApiResponse<{ data: Message }>>
) => {
  const queryClient = useQueryClient();
  const { onSuccess: configsOnSuccess, ...rest } = configs ?? {};
  return useMutation<IApiResponse<{ data: Message }>, Error, SendVars>({
    mutationFn: ({ conversationId, body }: SendVars) =>
      messageApi.send(conversationId, body),
    ...rest,
    onSuccess: (data, vars, context, mutation) => {
      const newMessage = data?.data?.data;
      if (newMessage) {
        queryClient.setQueryData<MessagesInfinite | undefined>(
          [CHAT_QUERY_KEYS.GET_MESSAGES, vars.conversationId, { limit: 30 }],
          old => {
            if (!old) {
              return old;
            }
            const pages = [...old.pages];
            const last = pages[pages.length - 1];
            if (last) {
              pages[pages.length - 1] = {
                ...last,
                data: { ...last.data, data: [...last.data.data, newMessage] },
              };
            }
            return { ...old, pages };
          }
        );
      }
      configsOnSuccess?.(data, vars, context, mutation);
    },
  });
};

type EditVars = {
  conversationId: string;
  messageId: string;
  content: string;
};

export const useEditMessageMutation = (
  configs?: UseMutationOptions<IApiResponse<{ data: Message }>, Error, EditVars>
) =>
  useMutation<IApiResponse<{ data: Message }>, Error, EditVars>({
    mutationFn: ({ conversationId, messageId, content }: EditVars) =>
      messageApi.update(conversationId, messageId, content),
    ...configs,
  });

type DeleteVars = { conversationId: string; messageId: string };

export const useDeleteMessageMutation = (
  configs?: UseMutationOptions<
    IApiResponse<{ data: Message }>,
    Error,
    DeleteVars
  >
) =>
  useMutation<IApiResponse<{ data: Message }>, Error, DeleteVars>({
    mutationFn: ({ conversationId, messageId }: DeleteVars) =>
      messageApi.delete(conversationId, messageId),
    ...configs,
  });

type ReactVars = {
  conversationId: string;
  messageId: string;
  emoji: string;
};

export const useReactMessageMutation = (
  configs?: UseMutationOptions<
    IApiResponse<{
      conversationId: string;
      messageId: string;
      reactions: Message['reactions'];
    }>,
    Error,
    ReactVars
  >
) =>
  useMutation<
    IApiResponse<{
      conversationId: string;
      messageId: string;
      reactions: Message['reactions'];
    }>,
    Error,
    ReactVars
  >({
    mutationFn: ({ conversationId, messageId, emoji }: ReactVars) =>
      messageApi.react(conversationId, messageId, { emoji }),
    ...configs,
  });

type ReadVars = { conversationId: string };

export const useMarkConversationReadMutation = (
  configs?: UseMutationOptions<
    IApiResponse<{ conversationId: string; readAt: string }>,
    Error,
    ReadVars
  >
) =>
  useMutation<
    IApiResponse<{ conversationId: string; readAt: string }>,
    Error,
    ReadVars
  >({
    mutationFn: ({ conversationId }: ReadVars) =>
      messageApi.markRead(conversationId),
    ...configs,
  });
