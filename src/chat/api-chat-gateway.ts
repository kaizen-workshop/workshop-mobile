import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import { readSessionUserId, type TokenStorage } from '@/core/secure-storage';
import type { ChatMessage, MessagePage } from './message';

export function createApiChatGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
) {
  const request = async (
    path: string,
    method = 'GET',
    body?: unknown,
    headers: Record<string, string> = {},
  ) => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    return http.request<unknown>({
      path,
      ...(method === 'GET' ? {} : { method }),
      ...(body === undefined ? {} : { body }),
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        ...headers,
      },
    });
  };
  return {
    async currentUserId() {
      const tokenSubject = await readSessionUserId(tokenStorage);
      if (tokenSubject) return tokenSubject;
      const value = await request('/users/me');
      if (
        !value ||
        typeof value !== 'object' ||
        !('id' in value) ||
        typeof value.id !== 'string'
      )
        throw invalidResponse('profile');
      return value.id;
    },
    async load(
      groupId: string,
      cursor?: string,
      size = 20,
    ): Promise<MessagePage> {
      const query = new URLSearchParams({
        size: String(size),
        ...(cursor ? { cursor } : {}),
      });
      const value = await request(
        `/groups/${encodeURIComponent(groupId)}/messages?${query}`,
      );
      if (!isMessagePage(value)) throw invalidResponse('messages');
      return {
        items: value.content,
        ...(value.nextCursor ? { nextCursor: value.nextCursor } : {}),
        hasMore: value.hasMore,
      };
    },
    async send(
      groupId: string,
      content: string,
      idempotencyKey: string,
    ): Promise<ChatMessage> {
      if (!content.trim() || !idempotencyKey.trim())
        throw new AppError({ category: 'bad_request' });
      const value = await request(
        `/groups/${encodeURIComponent(groupId)}/messages`,
        'POST',
        { content: content.trim() },
        { 'Idempotency-Key': idempotencyKey },
      );
      if (!isMessage(value)) throw invalidResponse('message');
      return value;
    },
    async delete(groupId: string, messageId: string): Promise<ChatMessage> {
      const value = await request(
        `/groups/${encodeURIComponent(groupId)}/messages/${encodeURIComponent(messageId)}`,
        'DELETE',
      );
      if (!isMessage(value)) throw invalidResponse('message');
      return value;
    },
  };
}

function isMessagePage(value: unknown): value is {
  content: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
} {
  if (!value || typeof value !== 'object') return false;
  const page = value as {
    content?: unknown;
    nextCursor?: unknown;
    hasMore?: unknown;
  };
  return (
    Array.isArray(page.content) &&
    page.content.every(isMessage) &&
    (page.nextCursor === null || typeof page.nextCursor === 'string') &&
    typeof page.hasMore === 'boolean'
  );
}
function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ChatMessage>;
  return (
    typeof item.id === 'string' &&
    typeof item.groupId === 'string' &&
    typeof item.authorId === 'string' &&
    typeof item.authorName === 'string' &&
    (item.content === null || typeof item.content === 'string') &&
    typeof item.sentAt === 'string' &&
    (item.editedAt === null || typeof item.editedAt === 'string') &&
    (item.deletedAt === null || typeof item.deletedAt === 'string')
  );
}
function invalidResponse(resource: string) {
  return new AppError({
    category: 'unknown',
    technicalMessage: `Invalid ${resource} response.`,
  });
}
