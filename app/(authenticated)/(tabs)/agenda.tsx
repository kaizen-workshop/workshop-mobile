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
  const [loadError, setLoadError] = useState<unknown>();
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
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const loadingMoreRef = useRef(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await loadInitialWorkshops(gateway, filters);
      setWorkshops(result.data);
      setSource(result.source);
      setNextPage(result.page + 1);
      setHasMore(result.hasMore);
      setLoadMoreError(false);
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
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
      setNextPage(result.page + 1);
      setHasMore(result.hasMore);
      setLoadMoreError(false);
      setStatus('success');
    } catch {
      if (workshops.length === 0) setStatus('error');
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [filters, gateway, workshops.length]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || source === 'cache') return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const page = await gateway.loadPage(nextPage, filters);
      setWorkshops((current) => mergeWorkshops(current, page.items));
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
    } catch {
      setLoadMoreError(true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [filters, gateway, hasMore, nextPage, source]);

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
        setNextPage(result.page + 1);
        setHasMore(result.hasMore);
        setLoadMoreError(false);
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
      hasMore={hasMore}
      loadingMore={loadingMore}
      loadMoreError={loadMoreError}
      onLoadMore={loadMore}
      onRefresh={refresh}
      onRetry={load}
      refreshing={refreshing}
      source={source}
      status={status}
      error={loadError}
      workshops={workshops}
    />
  );
}

async function loadInitialWorkshops(
  gateway: ReturnType<typeof createApiWorkshopGateway>,
  filters: WorkshopFilters,
) {
  if (!isDefaultFilter(filters)) {
    const page = await gateway.loadPage(0, filters);
    return {
      data: page.items,
      source: 'network' as const,
      updatedAt: Date.now(),
      page: page.page,
      hasMore: page.hasMore,
    };
  }
  const userId = await gateway.getCurrentUserId();
  let networkPage: Awaited<ReturnType<typeof gateway.loadPage>> | undefined;
  const result = await loadWorkshopList({
    cache: createWorkshopCache({ userId }),
    loadRemote: async () => {
      networkPage = await gateway.loadPage(0, filters);
      return networkPage.items;
    },
  });
  return {
    ...result,
    page: networkPage?.page ?? 0,
    hasMore: result.source === 'network' && Boolean(networkPage?.hasMore),
  };
}

function isDefaultFilter(filters: WorkshopFilters) {
  return (
    filters.status === 'PUBLISHED' &&
    filters.themeId === undefined &&
    filters.categoryId === undefined
  );
}

function mergeWorkshops(
  current: readonly WorkshopSummary[],
  incoming: readonly WorkshopSummary[],
) {
  const known = new Set(current.map((workshop) => workshop.id));
  return [
    ...current,
    ...incoming.filter((workshop) => !known.has(workshop.id)),
  ];
}
