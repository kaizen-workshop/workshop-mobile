import { StyleSheet, Text, View } from 'react-native';

import type { PaymentStatus } from '@/payment/domain';
import { colors, radii, spacing, typography } from '@/shared/theme';

const contentByStatus: Record<
  PaymentStatus,
  Readonly<{ label: string; description: string }>
> = {
  PENDING: {
    label: 'Pendente',
    description: 'Aguardando a confirmação do pagamento.',
  },
  PAID: {
    label: 'Pago',
    description: 'Pagamento confirmado.',
  },
  DECLINED: {
    label: 'Recusado',
    description: 'O pagamento não foi aprovado.',
  },
  CANCELLED: {
    label: 'Cancelado',
    description: 'O pagamento foi cancelado.',
  },
  REFUNDED: {
    label: 'Reembolsado',
    description: 'O pagamento foi reembolsado.',
  },
  EXEMPT: {
    label: 'Isento',
    description: 'Este pagamento não é necessário.',
  },
};

export function PaymentStatusScreen({
  status,
}: Readonly<{ status: PaymentStatus }>) {
  const content = contentByStatus[status];

  return (
    <View style={styles.page}>
      <Text accessibilityRole="header" style={styles.title}>
        Status do pagamento
      </Text>
      <View
        accessible
        accessibilityLabel={`${content.label}. ${content.description}`}
        style={styles.statusCard}
      >
        <Text style={styles.statusLabel}>{content.label}</Text>
        <Text style={styles.description}>{content.description}</Text>
      </View>
      <Text style={styles.note}>
        A situação apresentada é a informação mais recente fornecida pelo
        sistema.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  statusLabel: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: 20,
    fontWeight: typography.bold,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  note: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.label,
    lineHeight: 20,
    marginTop: spacing.md,
  },
});
