import { conversationApi } from '@/api';
import { CHAT_QUERY_KEYS } from '@/constants';
import type {
  AddMemberBody,
  Conversation,
  CreateConversationBody,
  IConversationResponse,
  RenameConversationBody,
} from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type CreateVars = { body: CreateConversationBody };
type RenameVars = { conversationId: string; body: RenameConversationBody };
type AvatarVars = { conversationId: string; file: File };
type AddMemberVars = { conversationId: string; body: AddMemberBody };
type RemoveMemberVars = { conversationId: string; userId: string };

export const useCreateConversationMutation = (
  configs?: IAppMutationOptions<CreateVars, IApiResponse<IConversationResponse>>
) =>
  useMutation<
    IApiResponse<IConversationResponse>,
    Error,
    CreateVars
  >({
    mutationFn: ({ body }: CreateVars) => conversationApi.create(body),
    ...configs,
  });

export const useRenameConversationMutation = (
  configs?: IAppMutationOptions<RenameVars, IApiResponse<IConversationResponse>>
) => {
  const queryClient = useQueryClient();
  const { onSuccess: configsOnSuccess, ...rest } = configs ?? {};
  return useMutation<
    IApiResponse<IConversationResponse>,
    Error,
    RenameVars
  >({
    mutationFn: ({ conversationId, body }: RenameVars) =>
      conversationApi.rename(conversationId, body),
    ...rest,
    onSuccess: (data, vars, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATION, vars.conversationId],
      });
      configsOnSuccess?.(data, vars, context, mutation);
    },
  });
};

export const useUploadConversationAvatarMutation = (
  configs?: IAppMutationOptions<AvatarVars, IApiResponse<IConversationResponse>>
) => {
  const queryClient = useQueryClient();
  const { onSuccess: configsOnSuccess, ...rest } = configs ?? {};
  return useMutation<
    IApiResponse<IConversationResponse>,
    Error,
    AvatarVars
  >({
    mutationFn: ({ conversationId, file }: AvatarVars) =>
      conversationApi.uploadAvatar(conversationId, file),
    ...rest,
    onSuccess: (data, vars, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATION, vars.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATIONS],
      });
      configsOnSuccess?.(data, vars, context, mutation);
    },
  });
};

export const useAddConversationMemberMutation = (
  configs?: IAppMutationOptions<
    AddMemberVars,
    IApiResponse<IConversationResponse>
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess: configsOnSuccess, ...rest } = configs ?? {};
  return useMutation<
    IApiResponse<IConversationResponse>,
    Error,
    AddMemberVars
  >({
    mutationFn: ({ conversationId, body }: AddMemberVars) =>
      conversationApi.addMember(conversationId, body),
    ...rest,
    onSuccess: (data, vars, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATION, vars.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATIONS],
      });
      configsOnSuccess?.(data, vars, context, mutation);
    },
  });
};

export const useRemoveConversationMemberMutation = (
  configs?: IAppMutationOptions<
    RemoveMemberVars,
    IApiResponse<IConversationResponse>
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess: configsOnSuccess, ...rest } = configs ?? {};
  return useMutation<
    IApiResponse<IConversationResponse>,
    Error,
    RemoveMemberVars
  >({
    mutationFn: ({ conversationId, userId }: RemoveMemberVars) =>
      conversationApi.removeMember(conversationId, userId),
    ...rest,
    onSuccess: (data, vars, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATION, vars.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATIONS],
      });
      configsOnSuccess?.(data, vars, context, mutation);
    },
  });
};

export type { Conversation };
