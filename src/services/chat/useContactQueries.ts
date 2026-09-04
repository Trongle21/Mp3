import { contactApi, presenceApi } from '@/api';
import { CHAT_QUERY_KEYS } from '@/constants';
import type {
  Contact,
  ContactRequestDecisionBody,
  ContactRequestsResponse,
  IContactListResponse,
  IContactRequestListResponse,
  PresenceMap,
} from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

interface IContactsQueryOptions<TData> {
  configs?: Omit<UseQueryOptions<IApiResponse<TData>, Error>, 'queryKey' | 'queryFn'>;
}

/** Fetch the accepted contacts list. */
export const useGetContactsQuery = (
  options?: IContactsQueryOptions<IContactListResponse>
) => {
  const { configs } = options ?? {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IContactListResponse>,
    Error
  >({
    queryKey: [CHAT_QUERY_KEYS.GET_CONTACTS],
    queryFn: () => contactApi.list() as Promise<
      IApiResponse<IContactListResponse>
    >,
    ...configs,
  });

  return {
    data: data?.data?.data as Contact[] | undefined,
    isLoading,
    isError,
    isFetching,
  };
};

/** Fetch incoming + outgoing pending contact requests. */
export const useGetContactRequestsQuery = (
  options?: IContactsQueryOptions<IContactRequestListResponse>
) => {
  const { configs } = options ?? {};

  const { data, isLoading, isError, isFetching } = useQuery<
    IApiResponse<IContactRequestListResponse>,
    Error
  >({
    queryKey: [CHAT_QUERY_KEYS.GET_CONTACT_REQUESTS],
    queryFn: () =>
      contactApi.list('pending') as Promise<
        IApiResponse<IContactRequestListResponse>
      >,
    ...configs,
  });

  return {
    data: data?.data?.data as ContactRequestsResponse | undefined,
    isLoading,
    isError,
    isFetching,
  };
};

type SendRequestVars = { recipientId?: string; email?: string };

export const useSendContactRequestMutation = (
  configs?: IAppMutationOptions<
    SendRequestVars,
    IApiResponse<{ contactId: string }>
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess: configsOnSuccess, ...rest } = configs ?? {};
  return useMutation<
    IApiResponse<{ contactId: string }>,
    Error,
    SendRequestVars
  >({
    mutationFn: (vars: SendRequestVars) => {
      if (vars.email && vars.email.trim()) {
        return contactApi.sendRequest({ email: vars.email.trim() });
      }
      if (vars.recipientId && vars.recipientId.trim()) {
        return contactApi.sendRequest({ recipientId: vars.recipientId.trim() });
      }
      return Promise.reject(
        new Error('recipientId or email is required')
      );
    },
    ...rest,
    onSuccess: (data, vars, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONTACT_REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONTACTS],
      });
      configsOnSuccess?.(data, vars, context, mutation);
    },
  });
};

type DecideVars = {
  contactId: string;
  body: ContactRequestDecisionBody;
};

export const useDecideContactRequestMutation = (
  configs?: IAppMutationOptions<
    DecideVars,
    IApiResponse<{ contactId: string; status: string }>
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess: configsOnSuccess, ...rest } = configs ?? {};
  return useMutation<
    IApiResponse<{ contactId: string; status: string }>,
    Error,
    DecideVars
  >({
    mutationFn: ({ contactId, body }: DecideVars) =>
      contactApi.decide(contactId, body),
    ...rest,
    onSuccess: (data, vars, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONTACT_REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONTACTS],
      });
      configsOnSuccess?.(data, vars, context, mutation);
    },
  });
};

type RemoveContactVars = { contactId: string };

export const useRemoveContactMutation = (
  configs?: IAppMutationOptions<
    RemoveContactVars,
    IApiResponse<{ contactId: string }>
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess: configsOnSuccess, ...rest } = configs ?? {};
  return useMutation<
    IApiResponse<{ contactId: string }>,
    Error,
    RemoveContactVars
  >({
    mutationFn: ({ contactId }: RemoveContactVars) =>
      contactApi.remove(contactId),
    ...rest,
    onSuccess: (data, vars, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONTACTS],
      });
      configsOnSuccess?.(data, vars, context, mutation);
    },
  });
};

interface IPresenceQueryOptions {
  configs?: Omit<
    UseQueryOptions<
      IApiResponse<{ presences: PresenceMap }>,
      Error,
      PresenceMap
    >,
    'queryKey' | 'queryFn' | 'select'
  >;
}

export const useGetPresenceBatchQuery = (
  userIds: string[],
  options?: IPresenceQueryOptions
) => {
  const { configs } = options ?? {};
  const sortedKey = [...userIds].sort().join(',');
  const queryKey = ['GET_PRESENCE_BATCH', sortedKey, ...userIds] as const;

  const { data, isLoading, isError } = useQuery({
    ...configs,
    queryKey,
    queryFn: () => presenceApi.getBatch(userIds),
    enabled: userIds.length > 0,
    select: (res: IApiResponse<{ presences: PresenceMap }>) =>
      res.data.presences,
  } as Parameters<typeof useQuery>[0]);

  return {
    data,
    isLoading,
    isError,
  };
};
