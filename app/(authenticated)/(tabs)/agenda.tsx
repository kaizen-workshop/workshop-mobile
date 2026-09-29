import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { createHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  createApiWorkshopGateway,
  createWorkshopCache,
  loadWorkshopList,
} from '@/workshop/data';
import type { WorkshopSummary } from '@/workshop/domain';
import { WorkshopListScreen } from '@/workshop/presentation';

export default function AgendaRoute() {
  const gateway = useMemo(
    () =>
      createApiWorkshopGateway(
        createHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [workshops, setWorkshops] = useState<readonly WorkshopSummary[]>([]);
  const [source, setSource] = useState<'network' | 'cache'>('network');
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await loadInitialWorkshops(gateway);
      setWorkshops(result.data);
      setSource(result.source);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [gateway]);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const result = await loadInitialWorkshops(gateway);
      setWorkshops(result.data);
      setSource(result.source);
      setStatus('success');
    } catch {
      if (workshops.length === 0) setStatus('error');
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [gateway, workshops.length]);

  useEffect(() => {
    let active = true;
    void loadInitialWorkshops(gateway)
      .then((result) => {
        if (!active) return;
        setWorkshops(result.data);
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
    <WorkshopListScreen
      onOpen={(workshop) =>
        router.push({
          pathname: '/(authenticated)/workshops/[id]',
          params: { id: workshop.id },
        })
      }
      onRefresh={refresh}
      onRetry={load}
      refreshing={refreshing}
      source={source}
      status={status}
      workshops={workshops}
    />
  );
}

async function loadInitialWorkshops(
  gateway: ReturnType<typeof createApiWorkshopGateway>,
) {
  const userId = await gateway.getCurrentUserId();
  return loadWorkshopList({
    cache: createWorkshopCache({ userId }),
    loadRemote: gateway.loadList,
  });
}
