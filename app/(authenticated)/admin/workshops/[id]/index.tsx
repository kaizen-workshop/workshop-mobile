import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  useAdminGateway,
  useAsyncData,
  WorkshopManageScreen,
  type ManagedWorkshop,
  type WorkshopTransition,
  adminHref,
} from '@/admin';
import { describeError } from '@/core/errors';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';

const successMessages: Record<WorkshopTransition, string> = {
  publish: 'Workshop publicado. Ele já aparece para os participantes.',
  close: 'Workshop encerrado.',
  cancel: 'Workshop cancelado.',
  archive: 'Workshop arquivado.',
};

export default function ManageWorkshopRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gateway = useAdminGateway();
  const loadWorkshop = useCallback(
    () => gateway.loadWorkshop(id),
    [gateway, id],
  );
  const loaded = useAsyncData(loadWorkshop);
  const [changed, setChanged] = useState<ManagedWorkshop>();
  const workshop = changed ?? loaded.data;
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'danger' | 'success';
    message: string;
  }>();

  // Coming back from the edit screen refreshes without flashing a spinner.
  useFocusEffect(
    useCallback(() => {
      setChanged(undefined);
      loaded.refresh();
    }, [loaded.refresh]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (loaded.status === 'loading' || loaded.status === 'error' || !workshop)
    return (
      <StatePage
        eyebrow="ARWEG · Administrativo"
        fallback="/admin/workshops"
        kind="back"
        title="Gerenciar workshop"
      >
        {loaded.status === 'error' ? (
          <ErrorState error={loaded.error} onRetry={loaded.reload} />
        ) : (
          <LoadingState message="Carregando workshop..." />
        )}
      </StatePage>
    );

  const transition = async (action: WorkshopTransition) => {
    if (busy) return;
    setBusy(true);
    setFeedback(undefined);
    try {
      setChanged(await gateway.transition(workshop.id, action));
      setFeedback({ tone: 'success', message: successMessages[action] });
    } catch (cause) {
      setFeedback({
        tone: 'danger',
        message: describeError(cause, {
          conflict:
            'Esta ação não é permitida na situação atual do workshop. Atualize a tela e confira o status.',
          forbidden: 'Você não tem permissão para alterar este workshop.',
          bad_request:
            'O workshop ainda não pode ser publicado. Confira se as datas de inscrição e do evento estão corretas.',
        }).message,
      });
    } finally {
      setBusy(false);
    }
  };

  const schedule = async (instant: string) => {
    if (busy) return;
    setBusy(true);
    setFeedback(undefined);
    try {
      setChanged(await gateway.schedule(workshop.id, instant));
      setFeedback({ tone: 'success', message: 'Publicação agendada.' });
    } catch (cause) {
      setFeedback({
        tone: 'danger',
        message: describeError(cause, {
          bad_request:
            'A data precisa estar no futuro e antes do início do workshop.',
          conflict: 'Só rascunhos podem ser agendados.',
        }).message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkshopManageScreen
      busy={busy}
      feedback={feedback}
      onEdit={() => router.push(adminHref.edit(workshop.id))}
      onOpenEvaluations={() => router.push(adminHref.evaluations(workshop.id))}
      onOpenMedia={() => router.push(adminHref.media(workshop.id))}
      onOpenParticipants={() =>
        router.push(adminHref.participants(workshop.id))
      }
      onSchedule={(instant) => void schedule(instant)}
      onTransition={(action) => void transition(action)}
      workshop={workshop}
    />
  );
}
