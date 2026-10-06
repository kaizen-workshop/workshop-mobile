import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createParticipantWorkshopGateway,
  ParticipantWorkshopScreen,
  type ParticipantWorkshop,
  type ParticipantWorkshopFilter,
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
  const [items, setItems] = useState<readonly ParticipantWorkshop[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<ParticipantWorkshopFilter>('COMPLETED');
  const loadingRef = useRef(false);
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const page = await gateway.loadHistory(filter);
      setItems(page.items);
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [filter, gateway]);
  useEffect(() => {
    let active = true;
    void gateway
      .loadHistory(filter)
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
  }, [filter, gateway]);
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const page = await gateway.loadHistory(filter, nextPage);
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
  }, [filter, gateway, hasMore, nextPage]);
  return (
    <ParticipantWorkshopScreen
      title="Histórico"
      emptyMessage={emptyMessages[filter]}
      items={items}
      status={status}
      loadingMore={loadingMore}
      onRetry={load}
      onLoadMore={hasMore ? loadMore : undefined}
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

const emptyMessages: Readonly<Record<ParticipantWorkshopFilter, string>> = {
  FUTURE: 'Você não possui workshops futuros.',
  IN_PROGRESS: 'Você não possui workshops em andamento.',
  COMPLETED: 'Você ainda não concluiu workshops.',
  CANCELLED: 'Você não possui workshops cancelados.',
  WAITING_LIST: 'Você não está em nenhuma lista de espera.',
};
