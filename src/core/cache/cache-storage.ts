import AsyncStorage from '@react-native-async-storage/async-storage';

const schemaVersion = 1;

type StorageAdapter = Pick<
  typeof AsyncStorage,
  'getItem' | 'setItem' | 'removeItem' | 'getAllKeys' | 'multiRemove'
>;

type CacheEnvelope<T> = Readonly<{
  version: typeof schemaVersion;
  updatedAt: number;
  expiresAt: number;
  data: T;
}>;

export type CacheEntry<T> = Readonly<{
  data: T;
  updatedAt: number;
}>;

export type CacheStorage = Readonly<{
  read<T>(key: string): Promise<CacheEntry<T> | null>;
  write<T>(
    key: string,
    data: T,
    options: Readonly<{ ttlMs: number; updatedAt?: number }>,
  ): Promise<void>;
  remove(key: string): Promise<void>;
  clearNamespace(): Promise<void>;
}>;

function isEnvelope(value: unknown): value is CacheEnvelope<unknown> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CacheEnvelope<unknown>>;
  return (
    candidate.version === schemaVersion &&
    typeof candidate.updatedAt === 'number' &&
    Number.isFinite(candidate.updatedAt) &&
    typeof candidate.expiresAt === 'number' &&
    Number.isFinite(candidate.expiresAt) &&
    'data' in candidate
  );
}

export function createCacheStorage({
  namespace,
  now = Date.now,
  storage = AsyncStorage,
}: Readonly<{
  namespace: string;
  now?: () => number;
  storage?: StorageAdapter;
}>): CacheStorage {
  const normalizedNamespace = namespace.trim();
  if (!normalizedNamespace) throw new Error('Cache namespace is required.');
  const prefix = `workshop.cache.${normalizedNamespace}.`;
  const storageKey = (key: string) => {
    const normalizedKey = key.trim();
    if (!normalizedKey) throw new Error('Cache key is required.');
    return `${prefix}${normalizedKey}`;
  };

  return {
    async read<T>(key: string) {
      const fullKey = storageKey(key);
      const serialized = await storage.getItem(fullKey);
      if (!serialized) return null;

      let parsed: unknown;
      try {
        parsed = JSON.parse(serialized);
      } catch {
        await storage.removeItem(fullKey);
        return null;
      }

      if (!isEnvelope(parsed) || parsed.expiresAt <= now()) {
        await storage.removeItem(fullKey);
        return null;
      }

      return { data: parsed.data as T, updatedAt: parsed.updatedAt };
    },

    async write<T>(
      key: string,
      data: T,
      options: Readonly<{ ttlMs: number; updatedAt?: number }>,
    ) {
      if (!Number.isFinite(options.ttlMs) || options.ttlMs <= 0)
        throw new Error('Cache ttlMs must be greater than zero.');
      const writtenAt = options.updatedAt ?? now();
      const envelope: CacheEnvelope<T> = {
        version: schemaVersion,
        updatedAt: writtenAt,
        expiresAt: now() + options.ttlMs,
        data,
      };
      await storage.setItem(storageKey(key), JSON.stringify(envelope));
    },

    async remove(key) {
      await storage.removeItem(storageKey(key));
    },

    async clearNamespace() {
      const keys = (await storage.getAllKeys()).filter((key) =>
        key.startsWith(prefix),
      );
      if (keys.length > 0) await storage.multiRemove(keys);
    },
  };
}
