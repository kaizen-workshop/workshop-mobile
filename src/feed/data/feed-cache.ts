import {
  createCacheStorage,
  type CacheEntry,
  type CacheStorage,
} from '@/core/cache';
import type { FeedCard } from '@/feed/domain';

const defaultTtlMs = 24 * 60 * 60 * 1_000;

export type FeedCache = Readonly<{
  read(): Promise<CacheEntry<readonly FeedCard[]> | null>;
  save(items: readonly FeedCard[], updatedAt?: number): Promise<void>;
  clear(): Promise<void>;
}>;

export function createFeedCache({
  userId,
  ttlMs = defaultTtlMs,
  cacheStorage,
}: Readonly<{
  userId: string;
  ttlMs?: number;
  cacheStorage?: CacheStorage;
}>): FeedCache {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) throw new Error('Feed cache userId is required.');

  const cache =
    cacheStorage ??
    createCacheStorage({
      namespace: `feed.${encodeURIComponent(normalizedUserId)}`,
    });

  return {
    read() {
      return cache.read<readonly FeedCard[]>('items');
    },

    save(items, updatedAt) {
      return cache.write('items', [...items], { ttlMs, updatedAt });
    },

    clear() {
      return cache.clearNamespace();
    },
  };
}
