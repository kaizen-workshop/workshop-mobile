import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  adminHref,
  PostFormScreen,
  useAdminGateway,
  useAsyncData,
  type PostFormValues,
} from '@/admin';
import { describeError } from '@/core/errors';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';

export default function EditPostRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gateway = useAdminGateway();
  const load = useCallback(async () => {
    const page = await gateway.listPosts();
    const post = page.items.find((item) => item.id === id);
    if (!post) throw new Error('post-not-found');
    return post;
  }, [gateway, id]);
  const loaded = useAsyncData(load);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'danger' | 'success';
    message: string;
  }>();

  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace(adminHref.posts);
  };

  if (loaded.status !== 'success' || !loaded.data)
    return (
      <StatePage
        eyebrow="ARWEG · Administrativo"
        fallback={adminHref.posts as never}
        kind="back"
        title="Editar post"
      >
        {loaded.status === 'error' ? (
          <ErrorState
            message="Não encontramos este post. Ele pode ter sido removido."
            onRetry={loaded.reload}
          />
        ) : (
          <LoadingState message="Carregando post..." />
        )}
      </StatePage>
    );

  const post = loaded.data;

  const save = async (values: PostFormValues, publish: boolean) => {
    if (busy) return;
    setBusy(true);
    setFeedback(undefined);
    try {
      await gateway.updatePost(post.id, {
        title: values.title.trim(),
        content: values.content.trim(),
        image: null,
        workshopId: null,
        categoryId: null,
        highlight: values.highlight,
      });
      if (publish) await gateway.publishPost(post.id);
      setFeedback({
        tone: 'success',
        message: publish ? 'Post publicado.' : 'Alterações salvas.',
      });
      setTimeout(() => router.replace(adminHref.posts), 700);
    } catch (cause) {
      setFeedback({
        tone: 'danger',
        message: describeError(cause, {
          conflict:
            'Este post já foi publicado ou arquivado e não pode mais ser editado.',
          bad_request: 'O post não foi aceito. Revise o título e o conteúdo.',
        }).message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PostFormScreen
      busy={busy}
      feedback={feedback}
      heading="Editar post"
      initial={{
        title: post.title,
        content: post.content,
        highlight: post.highlight,
      }}
      onCancel={back}
      onSave={(values, publish) => void save(values, publish)}
      publishLabel="Salvar e publicar"
      saveLabel="Salvar alterações"
      subtitle="Atualize o conteúdo antes de publicar."
    />
  );
}
