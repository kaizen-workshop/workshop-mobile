import { Pressable, StyleSheet, Text, View } from 'react-native';

import type {
  AttendanceStatus,
  ManagedParticipant,
  WorkshopPayment,
} from './admin';
import {
  AdminPage,
  Card,
  Heading,
  Notice,
  SectionTitle,
  StatusChip,
} from './admin-ui';
import { ErrorState, LoadingState } from '@/shared/presentation';
import { StatePage } from '@/navigation';
import { colors, radii, spacing, typography } from '@/shared/theme';

const attendanceOptions: readonly { value: AttendanceStatus; label: string }[] =
  [
    { value: 'ATTENDED', label: 'Presente' },
    { value: 'ABSENT', label: 'Faltou' },
    { value: 'JUSTIFIED_ABSENCE', label: 'Justificou' },
  ];

const registrationLabels: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendente',
  WAITING_LIST: 'Lista de espera',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

const paymentLabels: Record<string, string> = {
  EXEMPT: 'Isento',
  PENDING: 'Pagamento pendente',
  PAID: 'Pago',
  DECLINED: 'Recusado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

const attendanceEligible = ['CONFIRMED', 'REFUNDED'];

export function ParticipantsScreen({
  busyId,
  canSimulatePayments,
  error,
  feedback,
  onMarkAttendance,
  onRetry,
  onSimulate,
  participants,
  payments,
  status,
}: Readonly<{
  busyId?: string;
  canSimulatePayments: boolean;
  error?: unknown;
  feedback?: { tone: 'danger' | 'success'; message: string };
  onMarkAttendance(registrationId: string, status: AttendanceStatus): void;
  onRetry(): void;
  onSimulate(paymentId: string, outcome: 'paid' | 'declined'): void;
  participants: readonly ManagedParticipant[];
  payments: readonly WorkshopPayment[];
  status: 'loading' | 'error' | 'success';
}>) {
  const frame = (node: React.ReactNode) => (
    <StatePage
      eyebrow="ARWEG · Administrativo"
      fallback="/admin/workshops"
      kind="back"
      title="Participantes"
    >
      {node}
    </StatePage>
  );
  if (status === 'loading')
    return frame(<LoadingState message="Carregando participantes..." />);
  if (status === 'error')
    return frame(<ErrorState error={error} onRetry={onRetry} />);

  const pending = payments.filter((p) => p.status === 'PENDING');

  return (
    <AdminPage fallback="/admin/workshops" title="Participantes">
      <Heading
        title="Participantes e pagamentos"
        subtitle="Marque a presença e acompanhe os pagamentos deste workshop."
      />
      {feedback ? (
        <Notice tone={feedback.tone}>{feedback.message}</Notice>
      ) : null}

      {payments.length > 0 ? (
        <Card>
          <SectionTitle>Pagamentos</SectionTitle>
          {!canSimulatePayments && pending.length > 0 ? (
            <Notice tone="info">
              O gateway é simulado: somente administradores podem confirmar ou
              recusar pagamentos.
            </Notice>
          ) : null}
          {payments.map((payment) => (
            <View key={payment.paymentId} style={styles.item}>
              <View style={styles.itemHead}>
                <Text style={styles.name}>{payment.participantName}</Text>
                <Text style={styles.amount}>
                  R$ {Number(payment.amount).toFixed(2).replace('.', ',')}
                </Text>
              </View>
              <StatusChip
                label={paymentLabels[payment.status] ?? payment.status}
              />
              {payment.status === 'PENDING' && canSimulatePayments ? (
                <View style={styles.actions}>
                  <Action
                    busy={busyId === payment.paymentId}
                    label="Confirmar pagamento"
                    onPress={() => onSimulate(payment.paymentId, 'paid')}
                    tone="primary"
                  />
                  <Action
                    busy={busyId === payment.paymentId}
                    label="Recusar"
                    onPress={() => onSimulate(payment.paymentId, 'declined')}
                    tone="danger"
                  />
                </View>
              ) : null}
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <SectionTitle>{`Inscritos (${participants.length})`}</SectionTitle>
        {participants.length === 0 ? (
          <Text style={styles.empty}>
            Ainda não há inscrições neste workshop.
          </Text>
        ) : (
          participants.map((participant) => (
            <View key={participant.registrationId} style={styles.item}>
              <Text style={styles.name}>{participant.name}</Text>
              <Text style={styles.meta}>{participant.email}</Text>
              <View style={styles.chips}>
                <StatusChip
                  label={
                    registrationLabels[participant.registrationStatus] ??
                    participant.registrationStatus
                  }
                />
                <StatusChip
                  background={colors.surface2}
                  color={colors.textMuted}
                  label={
                    paymentLabels[participant.paymentStatus] ??
                    participant.paymentStatus
                  }
                />
              </View>
              {attendanceEligible.includes(participant.registrationStatus) ? (
                <View style={styles.actions}>
                  {attendanceOptions.map((option) => {
                    const selected =
                      participant.attendanceStatus === option.value;
                    return (
                      <Pressable
                        accessibilityLabel={`${option.label}: ${participant.name}`}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        disabled={busyId === participant.registrationId}
                        key={option.value}
                        onPress={() =>
                          onMarkAttendance(
                            participant.registrationId,
                            option.value,
                          )
                        }
                        style={({ pressed }) => [
                          styles.attendance,
                          selected && styles.attendanceSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.attendanceText,
                            selected && styles.attendanceTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.meta}>
                  A presença só pode ser marcada para inscrições confirmadas.
                </Text>
              )}
            </View>
          ))
        )}
      </Card>
    </AdminPage>
  );
}

function Action({
  busy,
  label,
  onPress,
  tone,
}: Readonly<{
  busy: boolean;
  label: string;
  onPress(): void;
  tone: 'primary' | 'danger';
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        tone === 'danger' ? styles.actionDanger : styles.actionPrimary,
        (pressed || busy) && styles.pressed,
      ]}
    >
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    borderTopColor: colors.surface3,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  itemHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  amount: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pressed: { opacity: 0.72 },
  attendance: {
    backgroundColor: colors.background,
    borderColor: colors.surface3,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  attendanceSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  attendanceText: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
  },
  attendanceTextSelected: { color: colors.onBrand },
  action: {
    borderRadius: radii.xl,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  actionPrimary: { backgroundColor: colors.brand },
  actionDanger: { backgroundColor: colors.dangerStrong },
  actionText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.bodySmall,
    fontWeight: typography.bold,
  },
});
