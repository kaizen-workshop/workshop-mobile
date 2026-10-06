import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import { readSessionUserId, type TokenStorage } from '@/core/secure-storage';
import type { FeedCard, FeedPage } from '@/feed/domain';

type PostResponse = Readonly<{
  id: string;
  title: string;
  content: string;
  image?: string | null;
  workshopId: string | null;
  highlight: boolean;
  publishedAt: string | null;
  likeCount: number;
  likedByMe: boolean;
}>;

type PageResponse = Readonly<{
  content: readonly PostResponse[];
  number: number;
  last: boolean;
}>;

export type FeedGateway = Readonly<{
  getCurrentUserId(): Promise<string>;
  loadPage(page: number, size?: number): Promise<FeedPage>;
  findPostIdForWorkshop(workshopId: string): Promise<string | undefined>;
  setLiked(postId: string, liked: boolean): Promise<void>;
}>;

export function createApiFeedGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): FeedGateway {
  const authenticated = async <T>(path: string, method = 'GET'): Promise<T> => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    return http.request<T>({
      path,
      ...(method === 'GET' ? {} : { method }),
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
  };

  return {
    async getCurrentUserId() {
      const tokenSubject = await readSessionUserId(tokenStorage);
      if (tokenSubject) return tokenSubject;
      const profile = await authenticated<unknown>('/users/me');
      if (
        !profile ||
        typeof profile !== 'object' ||
        !('id' in profile) ||
        typeof profile.id !== 'string'
      ) {
        throw invalidResponse('profile');
      }
      return profile.id;
    },
    async loadPage(page, size = 20) {
      if (
        !Number.isInteger(page) ||
        page < 0 ||
        !Number.isInteger(size) ||
        size < 1
      ) {
        throw new AppError({ category: 'bad_request' });
      }
      const response = await authenticated<unknown>(
        `/posts/feed?page=${page}&size=${size}`,
      );
      if (!isPageResponse(response)) throw invalidResponse('feed');
      return {
        items: response.content.map(toFeedCard),
        page: response.number,
        hasMore: !response.last,
      };
    },
    async findPostIdForWorkshop(workshopId) {
      if (!workshopId.trim()) throw new AppError({ category: 'bad_request' });
      let page = 0;
      while (page < 20) {
        const response = await authenticated<unknown>(
          `/posts/feed?page=${page}&size=100`,
        );
        if (!isPageResponse(response)) throw invalidResponse('feed');
        const related = response.content.find(
          (post) => post.workshopId === workshopId,
        );
        if (related) return related.id;
        if (response.last) return undefined;
        page = response.number + 1;
      }
      return undefined;
    },
    async setLiked(postId, liked) {
      if (!postId.trim()) throw new AppError({ category: 'bad_request' });
      await authenticated<void>(
        `/posts/${encodeURIComponent(postId)}/like`,
        liked ? 'PUT' : 'DELETE',
      );
    },
  };
}

export function mergeFeedItems(
  current: readonly FeedCard[],
  incoming: readonly FeedCard[],
): readonly FeedCard[] {
  const known = new Set(current.map((item) => `${item.kind}:${item.id}`));
  return [
    ...current,
    ...incoming.filter((item) => !known.has(`${item.kind}:${item.id}`)),
  ];
}

export function updateFeedLike(
  items: readonly FeedCard[],
  postId: string,
  likedByMe: boolean | undefined,
  likeCount: number | undefined,
): readonly FeedCard[] {
  return items.map((item) =>
    item.kind === 'post' && item.id === postId
      ? { ...item, likedByMe, likeCount }
      : item,
  );
}

function toFeedCard(post: PostResponse): FeedCard {
  return {
    id: post.id,
    kind: 'post',
    title: post.title,
    ...(post.image ? { imageUrl: post.image } : {}),
    summary: post.content,
    highlighted: post.highlight,
    ...(post.workshopId ? { relatedWorkshopId: post.workshopId } : {}),
    ...(post.publishedAt ? { context: post.publishedAt } : {}),
    likeCount: post.likeCount,
    likedByMe: post.likedByMe,
  };
}

function isPageResponse(value: unknown): value is PageResponse {
  if (!value || typeof value !== 'object') return false;
  const page = value as Partial<PageResponse>;
  return (
    Array.isArray(page.content) &&
    page.content.every(isPostResponse) &&
    typeof page.number === 'number' &&
    typeof page.last === 'boolean'
  );
}

function isPostResponse(value: unknown): value is PostResponse {
  if (!value || typeof value !== 'object') return false;
  const post = value as Partial<PostResponse>;
  return (
    typeof post.id === 'string' &&
    typeof post.title === 'string' &&
    typeof post.content === 'string' &&
    (post.image === undefined ||
      post.image === null ||
      typeof post.image === 'string') &&
    (post.workshopId === null || typeof post.workshopId === 'string') &&
    typeof post.highlight === 'boolean' &&
    (post.publishedAt === null || typeof post.publishedAt === 'string') &&
    typeof post.likeCount === 'number' &&
    typeof post.likedByMe === 'boolean'
  );
}

function invalidResponse(resource: string) {
  return new AppError({
    category: 'unknown',
    technicalMessage: `Invalid ${resource} response.`,
  });
}
