import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  ParticipantsScreen,
  useAdminGateway,
  useAsyncData,
  type AttendanceStatus,
} from '@/admin';
import { useRole } from '@/auth/session';
import { describeError } from '@/core/errors';

export default function ParticipantsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gateway = useAdminGateway();
  const role = useRole();
  const fetchAll = useCallback(async () => {
    const [people, workshopPayments] = await Promise.all([
      gateway.participants(id),
      gateway.payments(id),
    ]);
    return { participants: people.items, payments: workshopPayments };
  }, [gateway, id]);
  const loaded = useAsyncData(fetchAll);
  const [busyId, setBusyId] = useState<string>();
  const [feedback, setFeedback] = useState<{
    tone: 'danger' | 'success';
    message: string;
  }>();

  const run = async (
    key: string,
    action: () => Promise<void>,
    success: string,
  ) => {
    if (busyId) return;
    setBusyId(key);
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
            'Esta ação não é permitida na situação atual da inscrição ou do pagamento.',
          forbidden: 'Sua conta não tem permissão para esta ação.',
        }).message,
      });
    } finally {
      setBusyId(undefined);
    }
  };

  return (
    <ParticipantsScreen
      busyId={busyId}
      canSimulatePayments={role === 'ADMIN'}
      error={loaded.error}
      feedback={feedback}
      onMarkAttendance={(registrationId, attendance: AttendanceStatus) =>
        void run(
          registrationId,
          () =>
            gateway.markAttendance(id, [
              { registrationId, status: attendance },
            ]),
          'Presença registrada.',
        )
      }
      onRetry={loaded.reload}
      onSimulate={(paymentId, outcome) =>
        void run(
          paymentId,
          () => gateway.simulatePayment(paymentId, outcome),
          outcome === 'paid'
            ? 'Pagamento confirmado e inscrição liberada.'
            : 'Pagamento recusado. A vaga foi liberada.',
        )
      }
      participants={loaded.data?.participants ?? []}
      payments={loaded.data?.payments ?? []}
      status={loaded.status}
    />
  );
}
