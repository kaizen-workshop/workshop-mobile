import { Image } from 'expo-image';
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  MapPin,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';
import type { WorkshopSummary } from '@/workshop/domain';
import { useWorkshopImageSource } from './use-workshop-image-source';

export function WorkshopCard({
  onPress,
  workshop,
}: Readonly<{ onPress?: () => void; workshop: WorkshopSummary }>) {
  const { refreshImage, source: imageSource } = useWorkshopImageSource(
    workshop.imageUrl,
  );
  const content = (
    <>
      <Image
        accessibilityLabel={`Imagem do workshop ${workshop.title}`}
        contentFit="cover"
        onError={refreshImage}
        source={imageSource}
        style={styles.image}
        transition={180}
      />
      <View style={styles.body}>
        <View style={styles.topRow}>
          {workshop.theme ? (
            <View style={styles.themePill}>
              <View style={styles.themeDot} />
              <Text style={styles.theme}>{workshop.theme}</Text>
            </View>
          ) : (
            <View />
          )}
          {workshop.modality ? (
            <Text style={styles.modality}>{workshop.modality}</Text>
          ) : null}
        </View>
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
            <MetadataLine Icon={CalendarDays} value={workshop.scheduleLabel} />
          ) : null}
          {workshop.locationLabel ? (
            <MetadataLine Icon={MapPin} value={workshop.locationLabel} />
          ) : null}
          {workshop.priceLabel ? (
            <MetadataLine Icon={Banknote} value={workshop.priceLabel} />
          ) : null}
        </View>
        {workshop.registrationLabel ? (
          <Text style={styles.registration}>{workshop.registrationLabel}</Text>
        ) : null}
        {onPress ? (
          <View style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Ver detalhes</Text>
            <ArrowRight color={colors.onBrand} size={18} />
          </View>
        ) : null}
      </View>
    </>
  );

  if (!onPress) return <View style={styles.card}>{content}</View>;

  return (
    <Pressable
      accessibilityLabel={`Abrir workshop ${workshop.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

function MetadataLine({
  Icon,
  value,
}: Readonly<{
  Icon: ComponentType<{ color: string; size: number }>;
  value: string;
}>) {
  return (
    <View style={styles.metadataLine}>
      <Icon color={colors.brand} size={18} />
      <Text style={styles.metadataText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.surface3,
    borderRadius: radii.xxl,
    borderWidth: 1,
    marginBottom: spacing.lg,
    minHeight: sizes.touchTarget,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.995 }] },
  image: { height: 190, width: '100%' },
  body: { padding: spacing.md },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  themePill: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    maxWidth: '68%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  themeDot: {
    backgroundColor: colors.brand,
    borderRadius: radii.full,
    height: 6,
    width: 6,
  },
  theme: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.caption,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
  },
  modality: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
    lineHeight: 28,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metadataLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metadataText: {
    color: colors.text,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  registration: {
    color: colors.positive,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  detailsButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 50,
  },
  detailsButtonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
});
