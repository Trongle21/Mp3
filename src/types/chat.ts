/**
 * API pagination for cursor-based message history.
 * `nextBefore` is the oldest messageId in the returned page; pass it as
 * `?before=<nextBefore>` to fetch older messages.
 */
export interface ChatPagination {
  limit: number;
  nextBefore?: string | null;
}

/** Cursor query params for paginating messages. */
export interface ChatMessageQueryParams {
  limit?: number;
  before?: string;
}
