import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createParticipantWorkshopGateway,
  ParticipantWorkshopScreen,
  type HistoryFilter,
  type ParticipantWorkshop,
  type ParticipantWorkshopPage,
} from '@/calendar';
import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { selectWorkshop } from '@/navigation';

export default function HistoryRoute() {
  const gateway = useMemo(
    () =>
      createParticipantWorkshopGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const [items, setItems] = useState<readonly ParticipantWorkshop[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>('ALL');
  const loadingRef = useRef(false);
  const fetchPage = useCallback(
    async (
      which: HistoryFilter,
      page: number,
    ): Promise<ParticipantWorkshopPage> => {
      if (which !== 'ALL') return gateway.loadHistory(which, page);
      // "Todos" = concluídos + cancelados, newest first.
      const [completed, cancelled] = await Promise.all([
        gateway.loadHistory('COMPLETED', 0, 50),
        gateway.loadHistory('CANCELLED', 0, 50),
      ]);
      return {
        items: [...completed.items, ...cancelled.items].sort((a, b) =>
          b.startDate.localeCompare(a.startDate),
        ),
        page: 0,
        hasMore: false,
      };
    },
    [gateway],
  );
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const page = await fetchPage(filter, 0);
      setItems(page.items);
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [fetchPage, filter]);
  useEffect(() => {
    let active = true;
    void fetchPage(filter, 0)
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
  }, [fetchPage, filter]);
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const page = await fetchPage(filter, nextPage);
      setItems((current) => [
        ...current,
        ...page.items.filter(
          (item) => !current.some((old) => old.id === item.id),
        ),
      ]);
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, filter, hasMore, nextPage]);
  return (
    <ParticipantWorkshopScreen
      emptyMessage={emptyMessages[filter]}
      items={items}
      status={status}
      error={loadError}
      loadingMore={loadingMore}
      onRetry={load}
      onLoadMore={hasMore ? loadMore : undefined}
      onDiscover={() => router.replace('/(authenticated)/(tabs)/agenda')}
      selectedFilter={filter}
      onSelectFilter={(value) => {
        if (value !== filter) {
          setItems([]);
          setStatus('loading');
          setFilter(value);
        }
      }}
      onOpen={(item) => {
        selectWorkshop({ id: item.id, title: item.title });
        router.push('/(authenticated)/workshop');
      }}
    />
  );
}

const emptyMessages: Readonly<Record<HistoryFilter, string>> = {
  ALL: 'Você ainda não tem workshops concluídos ou cancelados.',
  FUTURE: 'Você não possui workshops futuros.',
  IN_PROGRESS: 'Você não possui workshops em andamento.',
  COMPLETED: 'Você ainda não concluiu workshops.',
  CANCELLED: 'Você não possui workshops cancelados.',
  WAITING_LIST: 'Você não está em nenhuma lista de espera.',
};
