import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CalendarScreen,
  createParticipantWorkshopGateway,
  monthRange,
  toIsoDate,
  type CalendarMonth,
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
  const today = toIsoDate(new Date());
  const [month, setMonth] = useState<CalendarMonth>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const [items, setItems] = useState<readonly ParticipantWorkshop[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const { from, to } = monthRange(month.year, month.month);
    void gateway
      .loadCalendar({ from, to, size: 100 })
      .then((page) => {
        if (!active) return;
        setItems(page.items);
        setStatus('success');
      })
      .catch((cause) => {
        if (!active) return;
        setLoadError(cause);
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [attempt, gateway, month]);

  const changeMonth = useCallback((delta: -1 | 1) => {
    setStatus('loading');
    setItems([]);
    setMonth((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      setSelectedDate(toIsoDate(next));
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }, []);

  return (
    <CalendarScreen
      error={loadError}
      items={items}
      month={month}
      onChangeMonth={changeMonth}
      onOpen={(item) => {
        selectWorkshop({ id: item.id, title: item.title });
        router.push('/(authenticated)/workshop');
      }}
      onRetry={() => {
        setStatus('loading');
        setAttempt((value) => value + 1);
      }}
      onSelectDate={setSelectedDate}
      selectedDate={selectedDate}
      status={status}
      today={today}
    />
  );
}
