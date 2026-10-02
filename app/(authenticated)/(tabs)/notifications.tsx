import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { createHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  createApiNotificationGateway,
  mergeNotifications,
  updateNotificationRead,
} from '@/notification/data';
import type { NotificationItem } from '@/notification/domain';
import { NotificationCentreScreen } from '@/notification/presentation';

export default function NotificationsRoute() {
  const gateway = useMemo(
    () =>
      createApiNotificationGateway(
        createHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<readonly NotificationItem[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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
    } catch {
      setStatus('error');
    }
  }, [gateway]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await gateway.loadPage(nextPage);
      setItems((current) => mergeNotifications(current, page.items));
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [gateway, hasMore, nextPage]);

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
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [gateway]);

  return (
    <NotificationCentreScreen
      items={items}
      loadingMore={loadingMore}
      onLoadMore={hasMore ? loadMore : undefined}
      onPress={markRead}
      onRetry={load}
      status={status}
    />
  );
}
