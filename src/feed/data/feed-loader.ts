import type { FeedCard } from '@/feed/domain';
import { AppError } from '@/core/errors';
import type { FeedCache } from './feed-cache';

export type FeedLoadResult = Readonly<{
  items: readonly FeedCard[];
  source: 'network' | 'cache';
  updatedAt: number;
}>;

export async function loadFeed({
  cache,
  loadRemote,
  now = Date.now,
}: Readonly<{
  cache: FeedCache;
  loadRemote(): Promise<readonly FeedCard[]>;
  now?: () => number;
}>): Promise<FeedLoadResult> {
  try {
    const items = await loadRemote();
    const updatedAt = now();

    try {
      await cache.save(items, updatedAt);
    } catch {
      // Fresh API content remains usable even when local storage is unavailable.
    }

    return { items, source: 'network', updatedAt };
  } catch (remoteError) {
    if (!isOfflineFallbackError(remoteError)) throw remoteError;
    try {
      const cached = await cache.read();
      if (cached)
        return {
          items: cached.data,
          source: 'cache',
          updatedAt: cached.updatedAt,
        };
    } catch {
      // Preserve the network failure instead of replacing it with a cache error.
    }

    throw remoteError;
  }
}

function isOfflineFallbackError(error: unknown) {
  return (
    error instanceof AppError &&
    (error.category === 'network' || error.category === 'timeout')
  );
}
