import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiChatGateway } from '@/chat/api-chat-gateway';
import { selectGroup } from '@/navigation';
import {
  createApiGroupGateway,
  GroupListScreen,
  type GroupPreview,
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
  const [previews, setPreviews] = useState<Record<string, GroupPreview>>({});
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
    const chat = createApiChatGateway(
      createAuthenticatedHttpClient(getEnvironment()),
      createTokenStorage(),
    );
    void gateway
      .loadPage()
      .then((page) => {
        if (!active) return;
        setItems(page.items);
        setStatus('success');
        // Previews are a nicety: a failure for one chat never breaks the list.
        void Promise.allSettled(
          page.items.map(async (group) => {
            const latest = (await chat.load(group.id, undefined, 1)).items[0];
            return latest && !latest.deletedAt && latest.content
              ? ([
                  group.id,
                  {
                    author: latest.authorName,
                    text: latest.content,
                    time: formatPreviewTime(latest.sentAt),
                  },
                ] as const)
              : null;
          }),
        ).then((results) => {
          if (!active) return;
          const next: Record<string, GroupPreview> = {};
          for (const result of results)
            if (result.status === 'fulfilled' && result.value)
              next[result.value[0]] = result.value[1];
          setPreviews(next);
        });
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
      previews={previews}
      status={status}
      error={loadError}
      onRetry={load}
      onOpen={(group) => {
        selectGroup({ id: group.id, title: group.workshopTitle });
        router.push('/(authenticated)/chat');
      }}
    />
  );
}

function formatPreviewTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  return sameDay
    ? new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    : new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }).format(date);
}
