jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import { createCacheStorage } from '@/core/cache';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      values.delete(key);
    }),
    getAllKeys: jest.fn(async () => [...values.keys()]),
    multiRemove: jest.fn(async (keys: readonly string[]) => {
      keys.forEach((key) => values.delete(key));
    }),
    values,
  };
}

it('stores versioned data with an explicit expiration', async () => {
  const storage = createMemoryStorage();
  const cache = createCacheStorage({
    namespace: 'feed.user-1',
    now: () => 1_000,
    storage,
  });

  await cache.write('first-page', { ids: ['one'] }, { ttlMs: 5_000 });

  await expect(cache.read<{ ids: string[] }>('first-page')).resolves.toEqual({
    data: { ids: ['one'] },
    updatedAt: 1_000,
  });
  expect(
    JSON.parse(storage.values.get('workshop.cache.feed.user-1.first-page')!),
  ).toMatchObject({ version: 1, expiresAt: 6_000 });
});

it('removes expired or malformed data instead of returning it', async () => {
  const storage = createMemoryStorage({
    'workshop.cache.feed.expired': JSON.stringify({
      version: 1,
      updatedAt: 100,
      expiresAt: 200,
      data: ['old'],
    }),
    'workshop.cache.feed.invalid': '{invalid',
  });
  const cache = createCacheStorage({
    namespace: 'feed',
    now: () => 300,
    storage,
  });

  await expect(cache.read('expired')).resolves.toBeNull();
  await expect(cache.read('invalid')).resolves.toBeNull();
  expect(storage.removeItem).toHaveBeenCalledTimes(2);
});

it('clears only the selected namespace', async () => {
  const storage = createMemoryStorage({
    'workshop.cache.feed.page': 'feed',
    'workshop.cache.chat.recent': 'chat',
    'unrelated.key': 'other',
  });
  const cache = createCacheStorage({ namespace: 'feed', storage });

  await cache.clearNamespace();

  expect(storage.values.has('workshop.cache.feed.page')).toBe(false);
  expect(storage.values.has('workshop.cache.chat.recent')).toBe(true);
  expect(storage.values.has('unrelated.key')).toBe(true);
});

it('rejects cache entries without a positive ttl', async () => {
  const cache = createCacheStorage({
    namespace: 'feed',
    storage: createMemoryStorage(),
  });

  await expect(cache.write('page', [], { ttlMs: 0 })).rejects.toThrow(
    'Cache ttlMs must be greater than zero.',
  );
});
