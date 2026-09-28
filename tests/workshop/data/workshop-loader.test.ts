jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import type { WorkshopCache } from '@/workshop/data';
import { loadWorkshopDetails, loadWorkshopList } from '@/workshop/data';

function createCacheDouble(
  overrides: Partial<WorkshopCache> = {},
): WorkshopCache {
  return {
    readList: jest.fn(async () => null),
    saveList: jest.fn(async () => undefined),
    readDetails: jest.fn(async () => null),
    saveDetails: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
    ...overrides,
  };
}

it('returns fresh workshops and updates the cache', async () => {
  const workshops = [{ id: 'one', title: 'Lean' }];
  const cache = createCacheDouble();

  await expect(
    loadWorkshopList({
      cache,
      loadRemote: async () => workshops,
      now: () => 5_000,
    }),
  ).resolves.toEqual({
    data: workshops,
    source: 'network',
    updatedAt: 5_000,
  });
  expect(cache.saveList).toHaveBeenCalledWith(workshops, 5_000);
});

it('returns the saved list when the remote read fails', async () => {
  const networkError = new Error('offline');
  const cached = [{ id: 'cached', title: 'Workshop salvo' }];
  const cache = createCacheDouble({
    readList: jest.fn(async () => ({ data: cached, updatedAt: 4_000 })),
  });

  await expect(
    loadWorkshopList({
      cache,
      loadRemote: async () => Promise.reject(networkError),
    }),
  ).resolves.toEqual({
    data: cached,
    source: 'cache',
    updatedAt: 4_000,
  });
});

it('returns saved details when the remote read fails', async () => {
  const cached = { id: 'one', title: 'Workshop salvo' };
  const cache = createCacheDouble({
    readDetails: jest.fn(async () => ({ data: cached, updatedAt: 4_000 })),
  });

  await expect(
    loadWorkshopDetails({
      id: 'one',
      cache,
      loadRemote: async () => Promise.reject(new Error('offline')),
    }),
  ).resolves.toEqual({
    data: cached,
    source: 'cache',
    updatedAt: 4_000,
  });
  expect(cache.readDetails).toHaveBeenCalledWith('one');
});

it('preserves the remote error when no readable cache exists', async () => {
  const networkError = new Error('network unavailable');
  const cache = createCacheDouble();

  await expect(
    loadWorkshopList({
      cache,
      loadRemote: async () => Promise.reject(networkError),
    }),
  ).rejects.toBe(networkError);
});

it('does not hide fresh data when writing the cache fails', async () => {
  const workshops = [{ id: 'one', title: 'Lean' }];
  const cache = createCacheDouble({
    saveList: jest.fn(async () => Promise.reject(new Error('storage error'))),
  });

  await expect(
    loadWorkshopList({
      cache,
      loadRemote: async () => workshops,
      now: () => 5_000,
    }),
  ).resolves.toEqual({
    data: workshops,
    source: 'network',
    updatedAt: 5_000,
  });
});
