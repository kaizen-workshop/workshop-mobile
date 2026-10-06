import {
  createCacheStorage,
  type CacheEntry,
  type CacheStorage,
} from '@/core/cache';
import type { WorkshopDetails, WorkshopSummary } from '@/workshop/domain';

const defaultTtlMs = 24 * 60 * 60 * 1_000;

export type WorkshopCache = Readonly<{
  readList(): Promise<CacheEntry<readonly WorkshopSummary[]> | null>;
  saveList(
    workshops: readonly WorkshopSummary[],
    updatedAt?: number,
  ): Promise<void>;
  readDetails(id: string): Promise<CacheEntry<WorkshopDetails> | null>;
  saveDetails(workshop: WorkshopDetails, updatedAt?: number): Promise<void>;
  clear(): Promise<void>;
}>;

function requiredValue(value: string, message: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error(message);
  return normalized;
}

export function createWorkshopCache({
  userId,
  ttlMs = defaultTtlMs,
  cacheStorage,
}: Readonly<{
  userId: string;
  ttlMs?: number;
  cacheStorage?: CacheStorage;
}>): WorkshopCache {
  const normalizedUserId = requiredValue(
    userId,
    'Workshop cache userId is required.',
  );
  const cache =
    cacheStorage ??
    createCacheStorage({
      namespace: `workshops.${encodeURIComponent(normalizedUserId)}`,
    });

  return {
    readList() {
      return cache.read<readonly WorkshopSummary[]>('list');
    },

    saveList(workshops, updatedAt) {
      return cache.write('list', [...workshops], { ttlMs, updatedAt });
    },

    async readDetails(id) {
      const normalizedId = requiredValue(id, 'Workshop id is required.');
      return cache.read<WorkshopDetails>(
        `details.${encodeURIComponent(normalizedId)}`,
      );
    },

    async saveDetails(workshop, updatedAt) {
      const normalizedId = requiredValue(
        workshop.id,
        'Workshop id is required.',
      );
      return cache.write(
        `details.${encodeURIComponent(normalizedId)}`,
        workshop,
        {
          ttlMs,
          updatedAt,
        },
      );
    },

    clear() {
      return cache.clearNamespace();
    },
  };
}
