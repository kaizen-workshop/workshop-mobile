import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { selectGroup } from '@/navigation';
import {
  createApiGroupGateway,
  GroupListScreen,
  type WorkshopGroup,
} from '@/group';
export default function GroupsRoute() {
  const gateway = useMemo(
    () =>
      createApiGroupGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [items, setItems] = useState<readonly WorkshopGroup[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setItems((await gateway.loadPage()).items);
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [gateway]);
  useEffect(() => {
    let active = true;
    void gateway
      .loadPage()
      .then((page) => {
        if (!active) return;
        setItems(page.items);
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
  }, [gateway]);
  return (
    <GroupListScreen
      items={items}
      status={status}
      error={loadError}
      onRetry={load}
      onOpen={(group) => {
        selectGroup({ id: group.id, title: group.workshopTitle });
        router.push('/(authenticated)/group');
      }}
    />
  );
}
