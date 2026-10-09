import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  adminHref,
  PostListScreen,
  useAdminGateway,
  useAsyncData,
  type ManagedPost,
} from '@/admin';
import { describeError } from '@/core/errors';

export default function ManagedPostsRoute() {
  const gateway = useAdminGateway();
  const load = useCallback(
    async () => (await gateway.listPosts()).items,
    [gateway],
  );
  const loaded = useAsyncData(load);
  const [busyId, setBusyId] = useState<string>();
  const [feedback, setFeedback] = useState<{
    tone: 'danger' | 'success';
    message: string;
  }>();

  // Coming back from the form shows the saved post without a spinner.
  useFocusEffect(
    useCallback(() => {
      loaded.refresh();
    }, [loaded.refresh]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const run = async (
    post: ManagedPost,
    action: () => Promise<void>,
    success: string,
  ) => {
    if (busyId) return;
    setBusyId(post.id);
    setFeedback(undefined);
    try {
      await action();
      loaded.refresh();
      setFeedback({ tone: 'success', message: success });
    } catch (cause) {
      setFeedback({
        tone: 'danger',
        message: describeError(cause, {
          conflict:
            'Esta ação não é permitida na situação atual do post. Atualize a tela.',
          forbidden: 'Você não tem permissão para alterar este post.',
          bad_request: 'A data precisa estar no futuro.',
        }).message,
      });
    } finally {
      setBusyId(undefined);
    }
  };

  return (
    <PostListScreen
      busyId={busyId}
      error={loaded.error}
      feedback={feedback}
      onArchive={(post) =>
        void run(post, () => gateway.archivePost(post.id), 'Post arquivado.')
      }
      onCreate={() => router.push(adminHref.newPost)}
      onEdit={(post) => router.push(adminHref.editPost(post.id))}
      onPublish={(post) =>
        void run(
          post,
          () => gateway.publishPost(post.id),
          'Post publicado. Ele já aparece no feed.',
        )
      }
      onRetry={loaded.reload}
      onSchedule={(post, instant) =>
        void run(
          post,
          () => gateway.schedulePost(post.id, instant),
          'Publicação agendada.',
        )
      }
      posts={loaded.data ?? []}
      status={loaded.status}
    />
  );
}
