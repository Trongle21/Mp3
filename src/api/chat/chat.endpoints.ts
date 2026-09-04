export const CONVERSATION_ENDPOINTS = {
  BASE: '/conversations',
  DETAIL: (id: string) => `/conversations/${id}`,
  AVATAR: (id: string) => `/conversations/${id}/avatar`,
  MEMBERS: (id: string) => `/conversations/${id}/members`,
  MEMBER: (id: string, userId: string) =>
    `/conversations/${id}/members/${userId}`,
  UPLOAD_URL: (id: string) => `/conversations/${id}/upload-url`,
  MESSAGES: (id: string) => `/conversations/${id}/messages`,
  MESSAGE: (id: string, msgId: string) =>
    `/conversations/${id}/messages/${msgId}`,
  REACT: (id: string, msgId: string) =>
    `/conversations/${id}/messages/${msgId}/react`,
  READ: (id: string) => `/conversations/${id}/messages/read`,
};

export const CONTACT_ENDPOINTS = {
  BASE: '/users/contacts',
  DETAIL: (id: string) => `/users/contacts/${id}`,
};

export const PRESENCE_ENDPOINTS = {
  BASE: '/users/presence',
  HEARTBEAT: '/users/presence/heartbeat',
};

export const SSE_ENDPOINT = '/sse/events';
