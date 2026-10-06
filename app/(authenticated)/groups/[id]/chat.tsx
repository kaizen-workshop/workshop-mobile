import { useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ChatScreen,
  createApiChatGateway,
  createChatRealtimeClient,
  type ChatMessage,
} from '@/chat';
import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiGroupGateway, type WorkshopGroup } from '@/group';
import { getSelectedGroup } from '@/navigation';

export default function ChatRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? getSelectedGroup()?.id ?? '';
  const dependencies = useMemo(
    () => ({
      http: createAuthenticatedHttpClient(getEnvironment()),
      storage: createTokenStorage(),
    }),
    [],
  );
  const chat = useMemo(
    () => createApiChatGateway(dependencies.http, dependencies.storage),
    [dependencies],
  );
  const groups = useMemo(
    () => createApiGroupGateway(dependencies.http, dependencies.storage),
    [dependencies],
  );
  const [group, setGroup] = useState<WorkshopGroup>();
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const pendingSend = useRef<{ content: string; key: string } | undefined>(
    undefined,
  );

  const applyInitial = useCallback(
    async (active: () => boolean) => {
      const [groupValue, user, page] = await Promise.all([
        groups.load(id),
        chat.currentUserId(),
        chat.load(id),
      ]);
      if (!active()) return;
      setGroup(groupValue);
      setUserId(user);
      setMessages(page.items);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
      setStatus('success');
    },
    [chat, groups, id],
  );

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      await applyInitial(() => true);
    } catch {
      setStatus('error');
    }
  }, [applyInitial]);

  useEffect(() => {
    let active = true;
    void Promise.all([groups.load(id), chat.currentUserId(), chat.load(id)])
      .then(([groupValue, user, page]) => {
        if (!active) return;
        setGroup(groupValue);
        setUserId(user);
        setMessages(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setStatus('success');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [chat, groups, id]);

  useEffect(() => {
    if (status !== 'success' || !group?.active) return;
    const merge = (incoming: readonly ChatMessage[]) => {
      setMessages((current) => {
        const byId = new Map(current.map((item) => [item.id, item]));
        incoming.forEach((item) => byId.set(item.id, item));
        return [...byId.values()].sort((left, right) =>
          right.sentAt.localeCompare(left.sentAt),
        );
      });
    };
    const realtime = createChatRealtimeClient({
      apiUrl: getEnvironment().apiUrl,
      groupId: id,
      tokenStorage: dependencies.storage,
      onMessage: (message) => merge([message]),
      onReconnect: async () => merge((await chat.load(id)).items),
    });
    realtime.start();
    return () => realtime.stop();
  }, [chat, dependencies.storage, group?.active, id, status]);

  return (
    <ChatScreen
      title={group?.workshopTitle ?? 'Chat'}
      active={group?.active ?? false}
      canSendMessages={group?.canSendMessages ?? false}
      canModerate={group?.canModerate ?? false}
      currentUserId={userId}
      messages={messages}
      status={status}
      sending={sending}
      sendError={sendError}
      hasMore={hasMore}
      onRetry={load}
      onLoadMore={async () => {
        if (!cursor) return;
        const page = await chat.load(id, cursor);
        setMessages((current) => [
          ...current,
          ...page.items.filter(
            (item) => !current.some((old) => old.id === item.id),
          ),
        ]);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
      }}
      onSend={async (content) => {
        setSending(true);
        setSendError(false);
        try {
          const normalized = content.trim();
          const operation =
            pendingSend.current?.content === normalized
              ? pendingSend.current
              : { content: normalized, key: Crypto.randomUUID() };
          pendingSend.current = operation;
          const sent = await chat.send(id, content, operation.key);
          setMessages((current) => [
            sent,
            ...current.filter((item) => item.id !== sent.id),
          ]);
          pendingSend.current = undefined;
          return true;
        } catch {
          setSendError(true);
          return false;
        } finally {
          setSending(false);
        }
      }}
      onDelete={async (message) => {
        try {
          const deleted = await chat.delete(id, message.id);
          setMessages((current) =>
            current.map((item) => (item.id === deleted.id ? deleted : item)),
          );
        } catch {
          setStatus('error');
        }
      }}
    />
  );
}
