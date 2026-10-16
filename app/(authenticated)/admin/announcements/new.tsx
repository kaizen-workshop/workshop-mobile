import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  adminHref,
  AnnouncementScreen,
  useAdminGateway,
  useAsyncData,
  type AnnouncementValues,
} from '@/admin';
import { describeError } from '@/core/errors';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';

export default function NewAnnouncementRoute() {
  const gateway = useAdminGateway();
  const [selectedId, setSelectedId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'danger' | 'success';
    message: string;
  }>();

  const loadWorkshops = useCallback(async () => {
    const page = await gateway.listWorkshops({ size: 50 });
    return page.items.filter((w) => w.status === 'PUBLISHED');
  }, [gateway]);
  const workshops = useAsyncData(loadWorkshops);

  // Recipients are the confirmed participants of the chosen workshop.
  const loadRecipients = useCallback(async () => {
    if (!selectedId) return [];
    const page = await gateway.participants(selectedId, 0, 200);
    return page.items.filter((p) => p.registrationStatus === 'CONFIRMED');
  }, [gateway, selectedId]);
  const recipients = useAsyncData(loadRecipients);

  if (workshops.status !== 'success')
    return (
      <StatePage
        eyebrow="ARWEG · Administrativo"
        fallback={adminHref.home as never}
        kind="back"
        title="Enviar comunicado"
      >
        {workshops.status === 'loading' ? (
          <LoadingState message="Carregando workshops..." />
        ) : (
          <ErrorState error={workshops.error} onRetry={workshops.reload} />
        )}
      </StatePage>
    );

  const send = async (values: AnnouncementValues) => {
    const people = recipients.data ?? [];
    if (busy || !selectedId || people.length === 0) return;
    setBusy(true);
    setFeedback(undefined);
    try {
      await gateway.sendAnnouncement({
        userIds: people.map((p) => p.userId),
        title: values.title.trim(),
        message: values.message.trim(),
        workshopId: selectedId,
      });
      setFeedback({
        tone: 'success',
        message: `Comunicado enviado para ${people.length} ${
          people.length === 1 ? 'pessoa' : 'pessoas'
        }.`,
      });
    } catch (cause) {
      setFeedback({
        tone: 'danger',
        message: describeError(cause, {
          bad_request:
            'O comunicado não foi aceito. Revise o título e a mensagem.',
          forbidden: 'Sua conta não pode enviar comunicados.',
        }).message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnnouncementScreen
      busy={busy}
      feedback={feedback}
      onCancel={() => {
        if (router.canGoBack()) router.back();
        else router.replace(adminHref.home);
      }}
      onSelectWorkshop={(id) => {
        setFeedback(undefined);
        setSelectedId(id);
      }}
      onSend={(values) => void send(values)}
      recipients={
        selectedId && recipients.status === 'success'
          ? (recipients.data?.length ?? 0)
          : undefined
      }
      selectedWorkshopId={selectedId}
      workshops={workshops.data ?? []}
    />
  );
}
