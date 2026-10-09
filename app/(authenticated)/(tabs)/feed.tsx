import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';

import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  createApiFeedGateway,
  createFeedCache,
  loadFeed,
  mergeFeedItems,
  updateFeedLike,
} from '@/feed/data';
import type { FeedCard, FeedPage } from '@/feed/domain';
import { FeedScreen } from '@/feed/presentation';
import { selectPost, selectWorkshop } from '@/navigation';

export default function FeedRoute() {
  const gateway = useMemo(
    () =>
      createApiFeedGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const [items, setItems] = useState<readonly FeedCard[]>([]);
  const [source, setSource] = useState<'network' | 'cache'>('network');
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cacheUserId, setCacheUserId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadingMoreRef = useRef(false);
  const refreshingRef = useRef(false);
  const pendingLikes = useRef(new Set<string>());

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await loadInitialFeed(gateway);
      setItems(result.items);
      setSource(result.source);
      setNextPage(result.nextPage);
      setHasMore(result.hasMore);
      setCacheUserId(result.userId);
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [gateway]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || source === 'cache') return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const page = await gateway.loadPage(nextPage);
      setItems((current) => {
        const merged = mergeFeedItems(current, page.items);
        if (cacheUserId)
          void createFeedCache({ userId: cacheUserId }).save(merged);
        return merged;
      });
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
    } catch {
      setLoadMoreError(true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [cacheUserId, gateway, hasMore, nextPage, source]);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const result = await loadInitialFeed(gateway);
      setItems(result.items);
      setSource(result.source);
      setNextPage(result.nextPage);
      setHasMore(result.hasMore);
      setCacheUserId(result.userId);
      setLoadMoreError(false);
      setStatus('success');
    } catch {
      if (items.length === 0) setStatus('error');
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [gateway, items.length]);

  const toggleLike = useCallback(
    async (item: FeedCard) => {
      if (item.kind !== 'post' || pendingLikes.current.has(item.id)) return;
      pendingLikes.current.add(item.id);
      const liked = !item.likedByMe;
      const likeCount = Math.max(0, (item.likeCount ?? 0) + (liked ? 1 : -1));
      setItems((current) => updateFeedLike(current, item.id, liked, likeCount));
      try {
        await gateway.setLiked(item.id, liked);
      } catch {
        setItems((current) =>
          updateFeedLike(current, item.id, item.likedByMe, item.likeCount),
        );
      } finally {
        pendingLikes.current.delete(item.id);
      }
    },
    [gateway],
  );

  useEffect(() => {
    let active = true;
    void loadInitialFeed(gateway)
      .then((result) => {
        if (!active) return;
        setItems(result.items);
        setSource(result.source);
        setNextPage(result.nextPage);
        setHasMore(result.hasMore);
        setCacheUserId(result.userId);
        setStatus('success');
      })
      .catch((cause) => {
        if (active) {
          setLoadError(cause);
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, [gateway]);

  return (
    <FeedScreen
      items={items}
      loadingMore={loadingMore}
      loadMoreError={loadMoreError}
      onLoadMore={hasMore ? loadMore : undefined}
      onItemPress={(item) => {
        if (item.kind === 'post') {
          selectPost({ id: item.id, title: item.title });
          router.push('/(authenticated)/comments');
        } else if (item.relatedWorkshopId) {
          selectWorkshop({ id: item.relatedWorkshopId, title: item.title });
          router.push('/(authenticated)/workshop');
        }
      }}
      onRefresh={refresh}
      onRetry={load}
      onToggleLike={toggleLike}
      source={source}
      status={status}
      error={loadError}
      refreshing={refreshing}
    />
  );
}

async function loadInitialFeed(
  gateway: ReturnType<typeof createApiFeedGateway>,
) {
  const userId = await gateway.getCurrentUserId();
  const remote: { page: FeedPage | null } = { page: null };
  const result = await loadFeed({
    cache: createFeedCache({ userId }),
    loadRemote: async () => {
      remote.page = await gateway.loadPage(0);
      return remote.page.items;
    },
  });
  return {
    ...result,
    userId,
    nextPage: remote.page ? remote.page.page + 1 : 1,
    hasMore: remote.page?.hasMore ?? false,
  };
}
