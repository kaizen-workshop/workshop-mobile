jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import type { CacheEntry, CacheStorage } from '@/core/cache';
import { createFeedCache, loadFeed } from '@/feed/data';

function createMemoryCacheStorage(): CacheStorage {
  const entries = new Map<string, CacheEntry<unknown>>();

  return {
    async read<T>(key: string) {
      return (entries.get(key) as CacheEntry<T> | undefined) ?? null;
    },
    async write<T>(
      key: string,
      data: T,
      options: Readonly<{ ttlMs: number; updatedAt?: number }>,
    ) {
      entries.set(key, {
        data,
        updatedAt: options.updatedAt ?? Date.now(),
      });
    },
    async remove(key: string) {
      entries.delete(key);
    },
    async clearNamespace() {
      entries.clear();
    },
  };
}

it('keeps the last successful feed available after connectivity is lost', async () => {
  const items = [
    { id: 'first', kind: 'post' as const, title: 'Primeiro' },
    { id: 'second', kind: 'workshop' as const, title: 'Segundo' },
  ];
  const cache = createFeedCache({
    userId: 'user-1',
    cacheStorage: createMemoryCacheStorage(),
  });
  let online = true;
  const loadRemote = jest.fn(async () => {
    if (!online) throw new Error('offline');
    return items;
  });

  await expect(
    loadFeed({ cache, loadRemote, now: () => 2_000 }),
  ).resolves.toEqual({
    items,
    source: 'network',
    updatedAt: 2_000,
  });

  online = false;

  await expect(loadFeed({ cache, loadRemote })).resolves.toEqual({
    items,
    source: 'cache',
    updatedAt: 2_000,
  });
});

it('allows an explicit retry to recover after an offline failure', async () => {
  const items = [{ id: 'new', kind: 'post' as const, title: 'Conteúdo novo' }];
  const cache = createFeedCache({
    userId: 'user-1',
    cacheStorage: createMemoryCacheStorage(),
  });
  let attempt = 0;
  const loadRemote = jest.fn(async () => {
    attempt += 1;
    if (attempt === 1) throw new Error('offline');
    return items;
  });

  await expect(loadFeed({ cache, loadRemote })).rejects.toThrow('offline');
  await expect(
    loadFeed({ cache, loadRemote, now: () => 3_000 }),
  ).resolves.toEqual({
    items,
    source: 'network',
    updatedAt: 3_000,
  });
  expect(loadRemote).toHaveBeenCalledTimes(2);
  await expect(cache.read()).resolves.toEqual({
    data: items,
    updatedAt: 3_000,
  });
});
