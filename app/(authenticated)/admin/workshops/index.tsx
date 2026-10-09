import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import {
  ManagedWorkshopListScreen,
  useAdminGateway,
  type ManagedWorkshop,
  adminHref,
} from '@/admin';

export default function ManagedWorkshopsRoute() {
  const gateway = useAdminGateway();
  const [items, setItems] = useState<readonly ManagedWorkshop[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [error, setError] = useState<unknown>();
  const nextPage = useRef(1);
  const loadingMore = useRef(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const page = await gateway.listWorkshops({ size: 50 });
      setItems(page.items);
      setHasMore(page.hasMore);
      nextPage.current = page.page + 1;
      setStatus('success');
    } catch (cause) {
      setError(cause);
      setStatus('error');
    }
  }, [gateway]);

  // Reload on focus so a workshop created or changed elsewhere shows up.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const loadMore = async () => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    try {
      const page = await gateway.listWorkshops({
        page: nextPage.current,
        size: 50,
      });
      setItems((current) => [...current, ...page.items]);
      setHasMore(page.hasMore);
      nextPage.current = page.page + 1;
    } catch {
      // The list already on screen stays usable; "Carregar mais" can be retried.
    } finally {
      loadingMore.current = false;
    }
  };

  return (
    <ManagedWorkshopListScreen
      error={error}
      hasMore={hasMore}
      items={items}
      onCreate={() => router.push(adminHref.newWorkshop)}
      onLoadMore={() => void loadMore()}
      onOpen={(workshop) => router.push(adminHref.manage(workshop.id))}
      onRetry={() => void load()}
      status={status}
    />
  );
}
