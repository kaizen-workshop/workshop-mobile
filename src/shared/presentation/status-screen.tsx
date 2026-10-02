import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/shared/theme';

export function StatusScreen({
  description,
  label,
  title,
}: Readonly<{ description: string; label: string; title: string }>) {
  return (
    <View style={styles.page}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <View
        accessible
        accessibilityLabel={`${label}. ${description}`}
        style={styles.statusCard}
      >
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
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
