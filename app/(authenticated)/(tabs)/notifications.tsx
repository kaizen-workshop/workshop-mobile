import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';

import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  createApiNotificationGateway,
  markAllNotificationsRead,
  mergeNotifications,
  updateNotificationRead,
} from '@/notification/data';
import type { NotificationItem } from '@/notification/domain';
import { selectGroup, selectPost, selectWorkshop } from '@/navigation';
import {
  NotificationCentreScreen,
  resolveNotificationRoute,
} from '@/notification/presentation';

export default function NotificationsRoute() {
  const gateway = useMemo(
    () =>
      createApiNotificationGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const [items, setItems] = useState<readonly NotificationItem[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const loadingMoreRef = useRef(false);
  const markingRead = useRef(new Set<string>());

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const page = await gateway.loadPage(0);
      setItems(page.items);
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [gateway]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const page = await gateway.loadPage(nextPage);
      setItems((current) => mergeNotifications(current, page.items));
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
    } catch {
      setLoadMoreError(true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [gateway, hasMore, nextPage]);

  const markAllRead = useCallback(async () => {
    const previous = items;
    setItems(markAllNotificationsRead(previous));
    try {
      await gateway.markAllRead();
    } catch {
      setItems(previous);
    }
  }, [gateway, items]);

  const markRead = useCallback(
    async (item: NotificationItem) => {
      if (item.read || markingRead.current.has(item.id)) return;
      markingRead.current.add(item.id);
      setItems((current) => updateNotificationRead(current, item.id, true));
      try {
        await gateway.markRead(item.id);
      } catch {
        setItems((current) => updateNotificationRead(current, item.id, false));
      } finally {
        markingRead.current.delete(item.id);
      }
    },
    [gateway],
  );

  useEffect(() => {
    let active = true;
    void gateway
      .loadPage(0)
      .then((page) => {
        if (!active) return;
        setItems(page.items);
        setNextPage(page.page + 1);
        setHasMore(page.hasMore);
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
    <NotificationCentreScreen
      items={items}
      loadingMore={loadingMore}
      loadMoreError={loadMoreError}
      onLoadMore={hasMore ? loadMore : undefined}
      onMarkAllRead={markAllRead}
      onPress={async (item) => {
        await markRead(item);
        const target = resolveNotificationRoute(item);
        if (target?.pathname === '/(authenticated)/workshops/[id]') {
          selectWorkshop({ id: target.params.id });
          router.push('/(authenticated)/workshop');
        } else if (
          target?.pathname === '/(authenticated)/posts/[id]/comments'
        ) {
          selectPost({ id: target.params.id });
          router.push('/(authenticated)/comments');
        } else if (target?.pathname === '/(authenticated)/groups/[id]') {
          selectGroup({ id: target.params.id });
          router.push('/(authenticated)/group');
        } else if (target) router.push(target);
      }}
      onRetry={load}
      status={status}
      error={loadError}
    />
  );
}
