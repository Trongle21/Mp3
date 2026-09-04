export interface UserBasic {
  _id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export type ConversationType = 'direct' | 'group';

export type MessageType =
  | 'text'
  | 'image'
  | 'sticker'
  | 'gif'
  | 'audio'
  | 'system';

export interface LastMessagePreview {
  content: string;
  senderId: string | null;
  senderName: string;
  type: MessageType;
  createdAt: string | null;
}

export interface Conversation {
  _id: string;
  type: ConversationType;
  name?: string;
  avatarUrl?: string | null;
  owner?: UserBasic | null;
  members: UserBasic[];
  lastMessage?: LastMessagePreview;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface ReadReceipt {
  userId: string;
  readAt: string;
}

export interface MessageReplyTo {
  _id: string;
  sender: { _id: string; name: string };
  content: string;
  type: string;
  deletedAt?: string | null;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: UserBasic;
  type: MessageType;
  /** Text body, sticker key, or R2 file key for media messages. */
  content: string;
  /** Public URL to display image/audio/sticker. Backend fills this for media. */
  mediaUrl?: string | null;
  replyTo?: MessageReplyTo | null;
  reactions: Reaction[];
  readBy: ReadReceipt[];
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
}

/**
 * Internal-only extension of Message that carries the optimistic-update
 * state while a message is still being uploaded / confirmed by the server.
 */
export interface LocalMessage extends Message {
  /** True until the server confirms this message id. */
  _pending?: boolean;
}

export interface Contact {
  contactId: string;
  user: UserBasic;
  createdAt: string;
}

export interface PendingContactRequest {
  _id: string;
  requester: UserBasic;
  recipient: UserBasic;
  status: 'pending';
  createdAt: string;
}

export interface ContactRequestsResponse {
  incoming: PendingContactRequest[];
  outgoing: PendingContactRequest[];
}

export interface UserPresence {
  isOnline: boolean;
  lastSeen: string | null;
}

export type PresenceMap = Record<string, UserPresence>;

export interface SendMessageBody {
  type: MessageType;
  content: string;
  replyTo?: string;
}

export interface CreateDirectConversationBody {
  type: 'direct';
  recipientId: string;
}

export interface CreateGroupConversationBody {
  type: 'group';
  name: string;
  memberIds: string[];
}

export type CreateConversationBody =
  | CreateDirectConversationBody
  | CreateGroupConversationBody;

export interface RenameConversationBody {
  name: string;
}

export interface AddMemberBody {
  userId: string;
}

export interface ReactMessageBody {
  emoji: string;
}

export interface ContactRequestByIdBody {
  recipientId: string;
}

export interface ContactRequestByEmailBody {
  email: string;
}

export type ContactRequestBody =
  | ContactRequestByIdBody
  | ContactRequestByEmailBody;

export type ContactRequestAction = 'accept' | 'decline' | 'block';

export interface ContactRequestDecisionBody {
  action: ContactRequestAction;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

export interface PresignedUploadRequest {
  filename: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface IPaginatedConversations {
  data: Conversation[];
  pagination: import('@/types/api-response').Pagination;
}

export interface IConversationResponse {
  data: Conversation;
}

export interface IMessageListResponse {
  data: Message[];
  pagination: import('@/types/chat').ChatPagination;
}

export type MessagesPageData = Message[];

export interface MessagesPage {
  data: MessagesPageData;
  pagination: import('@/types/chat').ChatPagination;
}

export interface IMessageResponse {
  data: Message;
}

export interface IContactListResponse {
  data: Contact[];
}

export interface IContactRequestListResponse {
  data: ContactRequestsResponse;
}
