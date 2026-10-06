import type { CacheEntry } from '@/core/cache';
import type { WorkshopDetails, WorkshopSummary } from '@/workshop/domain';
import type { WorkshopCache } from './workshop-cache';

export type WorkshopLoadResult<T> = Readonly<{
  data: T;
  source: 'network' | 'cache';
  updatedAt: number;
}>;

async function loadWithCache<T>({
  loadRemote,
  readCache,
  saveCache,
  now,
}: Readonly<{
  loadRemote(): Promise<T>;
  readCache(): Promise<CacheEntry<T> | null>;
  saveCache(data: T, updatedAt: number): Promise<void>;
  now(): number;
}>): Promise<WorkshopLoadResult<T>> {
  try {
    const data = await loadRemote();
    const updatedAt = now();

    try {
      await saveCache(data, updatedAt);
    } catch {
      // A cache failure must not hide fresh data already received from the API.
    }

    return { data, source: 'network', updatedAt };
  } catch (remoteError) {
    try {
      const cached = await readCache();
      if (cached)
        return {
          data: cached.data,
          source: 'cache',
          updatedAt: cached.updatedAt,
        };
    } catch {
      // Preserve the original network error when local storage is unavailable.
    }

    throw remoteError;
  }
}

export function loadWorkshopList({
  cache,
  loadRemote,
  now = Date.now,
}: Readonly<{
  cache: WorkshopCache;
  loadRemote(): Promise<readonly WorkshopSummary[]>;
  now?: () => number;
}>) {
  return loadWithCache({
    loadRemote,
    readCache: () => cache.readList(),
    saveCache: (workshops, updatedAt) => cache.saveList(workshops, updatedAt),
    now,
  });
}

export function loadWorkshopDetails({
  id,
  cache,
  loadRemote,
  now = Date.now,
}: Readonly<{
  id: string;
  cache: WorkshopCache;
  loadRemote(): Promise<WorkshopDetails>;
  now?: () => number;
}>) {
  return loadWithCache({
    loadRemote,
    readCache: () => cache.readDetails(id),
    saveCache: (workshop, updatedAt) => cache.saveDetails(workshop, updatedAt),
    now,
  });
}
