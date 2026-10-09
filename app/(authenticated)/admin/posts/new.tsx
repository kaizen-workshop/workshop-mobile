import { router } from 'expo-router';
import { useState } from 'react';

import {
  PostFormScreen,
  useAdminGateway,
  type PostFormValues,
  adminHref,
} from '@/admin';
import { describeError } from '@/core/errors';

export default function NewPostRoute() {
  const gateway = useAdminGateway();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'danger' | 'success';
    message: string;
  }>();

  const save = async (values: PostFormValues, publish: boolean) => {
    if (busy) return;
    setBusy(true);
    setFeedback(undefined);
    try {
      const id = await gateway.createPost({
        title: values.title.trim(),
        content: values.content.trim(),
        image: null,
        workshopId: null,
        categoryId: null,
        highlight: values.highlight,
      });
      if (publish) await gateway.publishPost(id);
      setFeedback({
        tone: 'success',
        message: publish
          ? 'Post publicado. Ele já aparece no feed.'
          : 'Rascunho salvo.',
      });
      setTimeout(() => router.replace(adminHref.posts), 900);
    } catch (cause) {
      setFeedback({
        tone: 'danger',
        message: describeError(cause, {
          bad_request: 'O post não foi aceito. Revise o título e o conteúdo.',
          forbidden: 'Sua conta não pode criar posts.',
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
      onCancel={() => {
        if (router.canGoBack()) router.back();
        else router.replace(adminHref.posts);
      }}
      onSave={(values, publish) => void save(values, publish)}
    />
  );
}
