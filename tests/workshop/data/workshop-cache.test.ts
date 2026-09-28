jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import type { CacheStorage } from '@/core/cache';
import { createWorkshopCache } from '@/workshop/data';

function createCacheStorageDouble() {
  const entries = new Map<string, { data: unknown; updatedAt: number }>();
  const read = jest.fn(async (key: string) => {
    const entry = entries.get(key);
    return entry ?? null;
  });
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
  return { cacheStorage, entries, write };
}

it('stores and reads the workshop list without losing its order', async () => {
  const { cacheStorage, write } = createCacheStorageDouble();
  const cache = createWorkshopCache({ userId: 'user-1', cacheStorage });
  const workshops = [
    { id: 'two', title: 'Segundo' },
    { id: 'one', title: 'Primeiro' },
  ];

  await cache.saveList(workshops, 2_000);

  await expect(cache.readList()).resolves.toEqual({
    data: workshops,
    updatedAt: 2_000,
  });
  expect(write).toHaveBeenCalledWith(
    'list',
    workshops,
    expect.objectContaining({ ttlMs: 86_400_000, updatedAt: 2_000 }),
  );
});

it('stores details separately by encoded workshop id', async () => {
  const { cacheStorage, write } = createCacheStorageDouble();
  const cache = createWorkshopCache({ userId: 'user-1', cacheStorage });
  const workshop = { id: 'lean/basic', title: 'Lean básico' };

  await cache.saveDetails(workshop, 3_000);

  await expect(cache.readDetails('lean/basic')).resolves.toEqual({
    data: workshop,
    updatedAt: 3_000,
  });
  expect(write).toHaveBeenCalledWith(
    'details.lean%2Fbasic',
    workshop,
    expect.any(Object),
  );
});

it('rejects an unidentified user and empty workshop ids', async () => {
  expect(() => createWorkshopCache({ userId: ' ' })).toThrow(
    'Workshop cache userId is required.',
  );

  const cache = createWorkshopCache({
    userId: 'user-1',
    cacheStorage: createCacheStorageDouble().cacheStorage,
  });
  await expect(cache.readDetails(' ')).rejects.toThrow(
    'Workshop id is required.',
  );
});
