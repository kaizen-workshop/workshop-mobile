import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { selectWorkshop } from '@/navigation';
import {
  createApiWorkshopGateway,
  createWorkshopCache,
  loadWorkshopList,
} from '@/workshop/data';
import type {
  WorkshopFilterOptions,
  WorkshopFilters,
  WorkshopSummary,
} from '@/workshop/domain';
import { WorkshopListScreen } from '@/workshop/presentation';

export default function AgendaRoute() {
  const environment = useMemo(() => getEnvironment(), []);
  const gateway = useMemo(
    () =>
      createApiWorkshopGateway(
        createAuthenticatedHttpClient(environment),
        createTokenStorage(),
        environment.apiUrl,
      ),
    [environment],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [workshops, setWorkshops] = useState<readonly WorkshopSummary[]>([]);
  const [filters, setFilters] = useState<WorkshopFilters>({
    status: 'PUBLISHED',
  });
  const [filterOptions, setFilterOptions] = useState<WorkshopFilterOptions>({
    themes: [],
    categories: [],
  });
  const [source, setSource] = useState<'network' | 'cache'>('network');
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await loadInitialWorkshops(gateway, filters);
      setWorkshops(result.data);
      setSource(result.source);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [filters, gateway]);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const result = await loadInitialWorkshops(gateway, filters);
      setWorkshops(result.data);
      setSource(result.source);
      setStatus('success');
    } catch {
      if (workshops.length === 0) setStatus('error');
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [filters, gateway, workshops.length]);

  useEffect(() => {
    let active = true;
    void gateway
      .loadFilterOptions()
      .then((options) => {
        if (active) setFilterOptions(options);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [gateway]);

  useEffect(() => {
    let active = true;
    void loadInitialWorkshops(gateway, filters)
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
  }, [filters, gateway]);

  return (
    <WorkshopListScreen
      filtering={status === 'loading' && workshops.length > 0}
      filterOptions={filterOptions}
      filters={filters}
      onFiltersChange={(nextFilters) => {
        setStatus('loading');
        setFilters(nextFilters);
      }}
      onOpen={(workshop) => {
        selectWorkshop({ id: workshop.id, title: workshop.title });
        router.push('/(authenticated)/workshop');
      }}
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
  filters: WorkshopFilters,
) {
  if (!isDefaultFilter(filters)) {
    const data = await gateway.loadList(filters);
    return { data, source: 'network' as const, updatedAt: Date.now() };
  }
  const userId = await gateway.getCurrentUserId();
  return loadWorkshopList({
    cache: createWorkshopCache({ userId }),
    loadRemote: () => gateway.loadList(filters),
  });
}

function isDefaultFilter(filters: WorkshopFilters) {
  return (
    filters.status === 'PUBLISHED' &&
    filters.themeId === undefined &&
    filters.categoryId === undefined
  );
}
