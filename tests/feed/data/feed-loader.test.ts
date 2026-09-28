jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import type { FeedCache } from '@/feed/data';
import { loadFeed } from '@/feed/data';

function createCacheDouble(overrides: Partial<FeedCache> = {}): FeedCache {
  return {
    read: jest.fn(async () => null),
    save: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
    ...overrides,
  };
}

it('prioritizes the remote feed and updates the saved snapshot', async () => {
  const items = [{ id: 'one', kind: 'post' as const, title: 'Novo post' }];
  const cache = createCacheDouble();

  await expect(
    loadFeed({ cache, loadRemote: async () => items, now: () => 5_000 }),
  ).resolves.toEqual({ items, source: 'network', updatedAt: 5_000 });
  expect(cache.save).toHaveBeenCalledWith(items, 5_000);
});

it('returns the saved feed when the remote read fails', async () => {
  const items = [{ id: 'saved', kind: 'post' as const, title: 'Post salvo' }];
  const cache = createCacheDouble({
    read: jest.fn(async () => ({ data: items, updatedAt: 4_000 })),
  });

  await expect(
    loadFeed({
      cache,
      loadRemote: async () => Promise.reject(new Error('offline')),
    }),
  ).resolves.toEqual({ items, source: 'cache', updatedAt: 4_000 });
});

it('preserves the remote error when no readable feed is cached', async () => {
  const networkError = new Error('network unavailable');
  const cache = createCacheDouble();

  await expect(
    loadFeed({
      cache,
      loadRemote: async () => Promise.reject(networkError),
    }),
  ).rejects.toBe(networkError);
});

it('keeps fresh feed content usable when the cache update fails', async () => {
  const items = [{ id: 'one', kind: 'post' as const, title: 'Novo post' }];
  const cache = createCacheDouble({
    save: jest.fn(async () => Promise.reject(new Error('storage error'))),
  });

  await expect(
    loadFeed({ cache, loadRemote: async () => items, now: () => 5_000 }),
  ).resolves.toEqual({ items, source: 'network', updatedAt: 5_000 });
});
