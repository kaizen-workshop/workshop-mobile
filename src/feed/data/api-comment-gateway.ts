import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import { readSessionUserId, type TokenStorage } from '@/core/secure-storage';
import type { CommentPage, PostComment } from '@/feed/domain/post-comment';
export function createApiCommentGateway(
  http: HttpClient,
  storage: TokenStorage,
) {
  const request = async (
    path: string,
    method = 'GET',
    body?: unknown,
    headers: Record<string, string> = {},
  ) => {
    const tokens = await storage.read();
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
      const tokenSubject = await readSessionUserId(storage);
      if (tokenSubject) return tokenSubject;
      const value = await request('/users/me');
      if (
        !value ||
        typeof value !== 'object' ||
        !('id' in value) ||
        typeof value.id !== 'string'
      )
        throw invalid();
      return value.id;
    },
    async load(postId: string, page = 0, size = 20): Promise<CommentPage> {
      const value = await request(
        `/posts/${encodeURIComponent(postId)}/comments?page=${page}&size=${size}`,
      );
      if (!isPage(value)) throw invalid();
      return { items: value.content, page: value.number, hasMore: !value.last };
    },
    async create(
      postId: string,
      content: string,
      idempotencyKey: string,
    ): Promise<PostComment> {
      if (!content.trim() || !idempotencyKey.trim())
        throw new AppError({ category: 'bad_request' });
      const value = await request(
        `/posts/${encodeURIComponent(postId)}/comments`,
        'POST',
        { content: content.trim() },
        { 'Idempotency-Key': idempotencyKey },
      );
      if (!isComment(value)) throw invalid();
      return value;
    },
    async edit(
      postId: string,
      commentId: string,
      content: string,
    ): Promise<PostComment> {
      if (!content.trim()) throw new AppError({ category: 'bad_request' });
      const value = await request(
        `/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
        'PATCH',
        { content: content.trim() },
      );
      if (!isComment(value)) throw invalid();
      return value;
    },
    async delete(postId: string, commentId: string): Promise<void> {
      await request(
        `/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
        'DELETE',
      );
    },
  };
}
function isPage(
  value: unknown,
): value is { content: PostComment[]; number: number; last: boolean } {
  if (!value || typeof value !== 'object') return false;
  const page = value as { content?: unknown; number?: unknown; last?: unknown };
  return (
    Array.isArray(page.content) &&
    page.content.every(isComment) &&
    typeof page.number === 'number' &&
    typeof page.last === 'boolean'
  );
}
function isComment(value: unknown): value is PostComment {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<PostComment>;
  return (
    typeof item.id === 'string' &&
    typeof item.userId === 'string' &&
    typeof item.content === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string'
  );
}
function invalid() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Invalid comments response.',
  });
}
