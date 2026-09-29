import { useCallback, useEffect, useMemo, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { createHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiFeedGateway, createFeedCache, loadFeed } from '@/feed/data';
import type { FeedCard } from '@/feed/domain';
import { FeedScreen } from '@/feed/presentation';

export default function FeedRoute() {
  const gateway = useMemo(
    () =>
      createApiFeedGateway(
        createHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<readonly FeedCard[]>([]);
  const [source, setSource] = useState<'network' | 'cache'>('network');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await loadInitialFeed(gateway);
      setItems(result.items);
      setSource(result.source);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [gateway]);

  useEffect(() => {
    let active = true;
    void loadInitialFeed(gateway)
      .then((result) => {
        if (!active) return;
        setItems(result.items);
        setSource(result.source);
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
    <FeedScreen
      items={items}
      onRefresh={load}
      onRetry={load}
      source={source}
      status={status}
    />
  );
}

async function loadInitialFeed(
  gateway: ReturnType<typeof createApiFeedGateway>,
) {
  const userId = await gateway.getCurrentUserId();
  return loadFeed({
    cache: createFeedCache({ userId }),
    loadRemote: async () => (await gateway.loadPage(0)).items,
  });
}
