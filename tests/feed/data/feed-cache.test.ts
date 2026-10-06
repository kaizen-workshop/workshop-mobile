jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import type { CacheStorage } from '@/core/cache';
import { createFeedCache } from '@/feed/data';

function createCacheStorageDouble() {
  const entries = new Map<string, { data: unknown; updatedAt: number }>();
  const read = jest.fn(async (key: string) => entries.get(key) ?? null);
  const write = jest.fn(
    async <T>(
      key: string,
      data: T,
      options: { ttlMs: number; updatedAt?: number },
    ) => {
      entries.set(key, { data, updatedAt: options.updatedAt ?? 1_000 });
    },
  );
  const cacheStorage: CacheStorage = {
    read: read as CacheStorage['read'],
    write: write as CacheStorage['write'],
    remove: jest.fn(async (key: string) => {
      entries.delete(key);
    }),
    clearNamespace: jest.fn(async () => {
      entries.clear();
    }),
  };
  return { cacheStorage, write };
}

it('stores and reads feed items without changing their order', async () => {
  const { cacheStorage, write } = createCacheStorageDouble();
  const cache = createFeedCache({ userId: 'user-1', cacheStorage });
  const items = [
    { id: 'post-2', kind: 'post' as const, title: 'Segundo' },
    { id: 'workshop-1', kind: 'workshop' as const, title: 'Primeiro' },
  ];

  await cache.save(items, 2_000);

  await expect(cache.read()).resolves.toEqual({
    data: items,
    updatedAt: 2_000,
  });
  expect(write).toHaveBeenCalledWith(
    'items',
    items,
    expect.objectContaining({ ttlMs: 86_400_000, updatedAt: 2_000 }),
  );
});

it('requires a user identity to partition the feed cache', () => {
  expect(() => createFeedCache({ userId: ' ' })).toThrow(
    'Feed cache userId is required.',
  );
});
