import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { WorkshopSummary } from '@/workshop/domain';
import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

export function WorkshopCard({
  onPress,
  workshop,
}: Readonly<{ onPress?: () => void; workshop: WorkshopSummary }>) {
  return (
    <Pressable
      accessibilityLabel={`Abrir workshop ${workshop.title}`}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={styles.card}
    >
      {workshop.theme ? (
        <Text style={styles.theme}>{workshop.theme}</Text>
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        {workshop.title}
      </Text>
      {workshop.description ? (
        <Text numberOfLines={3} style={styles.description}>
          {workshop.description}
        </Text>
      ) : null}
      <View style={styles.metadata}>
        {workshop.scheduleLabel ? (
          <Text style={styles.metadataText}>{workshop.scheduleLabel}</Text>
        ) : null}
        {workshop.locationLabel ? (
          <Text style={styles.metadataText}>{workshop.locationLabel}</Text>
        ) : null}
        {workshop.modality ? (
          <Text style={styles.metadataText}>{workshop.modality}</Text>
        ) : null}
        {workshop.priceLabel ? (
          <Text style={styles.metadataText}>{workshop.priceLabel}</Text>
        ) : null}
      </View>
      {workshop.registrationLabel ? (
        <Text style={styles.registration}>{workshop.registrationLabel}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  theme: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.label,
    fontWeight: typography.bold,
    marginBottom: spacing.xxs,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: 20,
    fontWeight: typography.bold,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  metadata: {
    gap: spacing.xxs,
    marginTop: spacing.sm,
  },
  metadataText: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
  },
  registration: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
    marginTop: spacing.sm,
  },
});
