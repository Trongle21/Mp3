import { AxiosService } from '@/api';
import type {
  AddMemberBody,
  ContactRequestBody,
  ContactRequestDecisionBody,
  Conversation,
  CreateConversationBody,
  IContactListResponse,
  IContactRequestListResponse,
  IConversationResponse,
  IMessageListResponse,
  IMessageResponse,
  Message,
  PresenceMap,
  PresignedUploadRequest,
  PresignedUploadResponse,
  ReactMessageBody,
  RenameConversationBody,
  SendMessageBody,
  UserPresence,
} from '@/interfaces';
import type {
  ChatMessageQueryParams,
  IApiResponse,
  IPaginatedResponse,
} from '@/types';
import {
  CONTACT_ENDPOINTS,
  CONVERSATION_ENDPOINTS,
  PRESENCE_ENDPOINTS,
} from './chat.endpoints';

export const conversationApi = {
  create: (body: CreateConversationBody) =>
    AxiosService.post<IConversationResponse>(CONVERSATION_ENDPOINTS.BASE, body),

  list: (params?: { page?: number; limit?: number }) =>
    AxiosService.get<IPaginatedResponse<Conversation>>(
      CONVERSATION_ENDPOINTS.BASE,
      { params }
    ),

  getById: (id: string) =>
    AxiosService.get<IConversationResponse>(CONVERSATION_ENDPOINTS.DETAIL(id)),

  rename: (id: string, body: RenameConversationBody) =>
    AxiosService.patch<IConversationResponse>(
      CONVERSATION_ENDPOINTS.DETAIL(id),
      body
    ),

  uploadAvatar: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return AxiosService.post<IConversationResponse>(
      CONVERSATION_ENDPOINTS.AVATAR(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  addMember: (id: string, body: AddMemberBody) =>
    AxiosService.post<IConversationResponse>(
      CONVERSATION_ENDPOINTS.MEMBERS(id),
      body
    ),

  removeMember: (id: string, userId: string) =>
    AxiosService.delete<IConversationResponse>(
      CONVERSATION_ENDPOINTS.MEMBER(id, userId)
    ),

  getUploadUrl: (id: string, body: PresignedUploadRequest) =>
    AxiosService.post<PresignedUploadResponse>(
      CONVERSATION_ENDPOINTS.UPLOAD_URL(id),
      body
    ),
};

export const messageApi = {
  send: (conversationId: string, body: SendMessageBody) =>
    AxiosService.post<IMessageResponse>(
      CONVERSATION_ENDPOINTS.MESSAGES(conversationId),
      body
    ),

  list: (
    conversationId: string,
    params?: ChatMessageQueryParams
  ): Promise<IApiResponse<IMessageListResponse>> =>
    AxiosService.get<IMessageListResponse>(
      CONVERSATION_ENDPOINTS.MESSAGES(conversationId),
      { params }
    ),

  getById: (conversationId: string, messageId: string) =>
    AxiosService.get<IMessageResponse>(
      CONVERSATION_ENDPOINTS.MESSAGE(conversationId, messageId)
    ),

  update: (conversationId: string, messageId: string, content: string) =>
    AxiosService.patch<IMessageResponse>(
      CONVERSATION_ENDPOINTS.MESSAGE(conversationId, messageId),
      { content }
    ),

  delete: (conversationId: string, messageId: string) =>
    AxiosService.delete<IMessageResponse>(
      CONVERSATION_ENDPOINTS.MESSAGE(conversationId, messageId)
    ),

  react: (conversationId: string, messageId: string, body: ReactMessageBody) =>
    AxiosService.post<{
      conversationId: string;
      messageId: string;
      reactions: Message['reactions'];
    }>(CONVERSATION_ENDPOINTS.REACT(conversationId, messageId), body),

  markRead: (conversationId: string) =>
    AxiosService.post<{ conversationId: string; readAt: string }>(
      CONVERSATION_ENDPOINTS.READ(conversationId)
    ),
};

export const contactApi = {
  list: (status?: 'pending') =>
    AxiosService.get<IContactListResponse | IContactRequestListResponse>(
      CONTACT_ENDPOINTS.BASE,
      { params: status ? { status } : undefined }
    ),

  sendRequest: (body: ContactRequestBody) =>
    AxiosService.post<{ contactId: string }>(CONTACT_ENDPOINTS.BASE, body),

  decide: (contactId: string, body: ContactRequestDecisionBody) =>
    AxiosService.patch<{ contactId: string; status: string }>(
      CONTACT_ENDPOINTS.DETAIL(contactId),
      body
    ),

  remove: (contactId: string) =>
    AxiosService.delete<{ contactId: string }>(
      CONTACT_ENDPOINTS.DETAIL(contactId)
    ),
};

export const presenceApi = {
  getBatch: (userIds: string[]) =>
    AxiosService.get<{ presences: PresenceMap }>(PRESENCE_ENDPOINTS.BASE, {
      params: { userIds: userIds.join(',') },
    }),

  heartbeat: () =>
    AxiosService.post<UserPresence>(PRESENCE_ENDPOINTS.HEARTBEAT),
};

/**
 * Uploads a binary file directly to Cloudflare R2 using a presigned PUT URL.
 * Does NOT route through the backend — keeps the API server out of the hot
 * path for media uploads.
 */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  // Use XHR for progress reporting; fetch() has no upload-progress events.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader(
      'Content-Type',
      file.type || 'application/octet-stream'
    );
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Upload network error'));
    xhr.send(file);
  });
}
