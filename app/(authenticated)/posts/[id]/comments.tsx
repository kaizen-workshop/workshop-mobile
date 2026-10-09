import { useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { describeError } from '@/core/errors';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiCommentGateway } from '@/feed/data';
import type { PostComment } from '@/feed/domain';
import { CommentsScreen } from '@/feed/presentation';
import { getSelectedPost } from '@/navigation';

export default function CommentsRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? getSelectedPost()?.id ?? '';
  const gateway = useMemo(
    () =>
      createApiCommentGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [items, setItems] = useState<readonly PostComment[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<boolean | string>(false);
  const [actionError, setActionError] = useState<boolean | string>(false);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const pendingCreate = useRef<{ content: string; key: string } | undefined>(
    undefined,
  );
  const loadInitial = useCallback(async () => {
    const [page, userId] = await Promise.all([
      gateway.load(id),
      gateway.currentUserId(),
    ]);
    return { page, userId };
  }, [gateway, id]);
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const { page, userId } = await loadInitial();
      setItems(page.items);
      setCurrentUserId(userId);
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [loadInitial]);

  useEffect(() => {
    let active = true;
    void loadInitial()
      .then(({ page, userId }) => {
        if (!active) return;
        setItems(page.items);
        setCurrentUserId(userId);
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
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await gateway.load(id, nextPage);
      setItems((current) => [
        ...current,
        ...page.items.filter(
          (item) => !current.some((existing) => existing.id === item.id),
        ),
      ]);
      setNextPage(page.page + 1);
      setHasMore(page.hasMore);
    } catch (cause) {
      setActionError(
        describeError(cause, {
          forbidden: 'Você não pode alterar este comentário.',
          not_found: 'Este comentário não existe mais. Atualize a tela.',
        }).message,
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [gateway, hasMore, id, nextPage]);

  return (
    <CommentsScreen
      items={items}
      currentUserId={currentUserId}
      status={status}
      error={loadError}
      sending={sending}
      sendError={sendError}
      actionError={actionError}
      loadingMore={loadingMore}
      onRetry={load}
      onLoadMore={hasMore ? loadMore : undefined}
      onSend={async (content) => {
        setSending(true);
        setSendError(false);
        setActionError(false);
        try {
          const normalized = content.trim();
          const operation =
            pendingCreate.current?.content === normalized
              ? pendingCreate.current
              : { content: normalized, key: Crypto.randomUUID() };
          pendingCreate.current = operation;
          const created = await gateway.create(id, content, operation.key);
          setItems((current) => [created, ...current]);
          pendingCreate.current = undefined;
          return true;
        } catch (cause) {
          setSendError(
            describeError(cause, {
              forbidden: 'Você não pode comentar nesta publicação.',
              not_found: 'Esta publicação não está mais disponível.',
            }).message,
          );
          return false;
        } finally {
          setSending(false);
        }
      }}
      onEdit={async (comment, content) => {
        setActionError(false);
        try {
          const updated = await gateway.edit(id, comment.id, content);
          setItems((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          return true;
        } catch (cause) {
          setActionError(
            describeError(cause, {
              forbidden: 'Você não pode alterar este comentário.',
              not_found: 'Este comentário não existe mais. Atualize a tela.',
            }).message,
          );
          return false;
        }
      }}
      onDelete={async (comment) => {
        setActionError(false);
        try {
          await gateway.delete(id, comment.id);
          setItems((current) =>
            current.filter((item) => item.id !== comment.id),
          );
        } catch (cause) {
          setActionError(
            describeError(cause, {
              forbidden: 'Você não pode alterar este comentário.',
              not_found: 'Este comentário não existe mais. Atualize a tela.',
            }).message,
          );
        }
      }}
    />
  );
}
