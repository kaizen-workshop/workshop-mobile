import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createParticipantWorkshopGateway,
  ParticipantWorkshopScreen,
  type ParticipantWorkshop,
} from '@/calendar';
import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { selectWorkshop } from '@/navigation';

export default function CalendarRoute() {
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
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const page = await gateway.loadCalendar();
      setItems(page.items);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [gateway]);
  useEffect(() => {
    let active = true;
    void gateway
      .loadCalendar()
      .then((page) => {
        if (!active) return;
        setItems(page.items);
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
    <ParticipantWorkshopScreen
      title="Meu calendário"
      emptyMessage="Nenhum workshop agendado."
      items={items}
      status={status}
      onRetry={load}
      onOpen={(item) => {
        selectWorkshop({ id: item.id, title: item.title });
        router.push('/(authenticated)/workshop');
      }}
    />
  );
}
