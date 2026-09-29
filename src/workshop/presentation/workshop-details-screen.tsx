import { useState } from 'react';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ErrorState, LoadingState } from '@/shared/presentation';
import { colors, radii, sizes, spacing, typography } from '@/shared/theme';
import type { WorkshopAttachment, WorkshopDetails } from '@/workshop/domain';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  workshop?: WorkshopDetails;
  source?: 'network' | 'cache';
  onRetry?: () => void;
  onOpenAttachment?: (attachment: WorkshopAttachment) => void;
  openingAttachmentId?: string;
  attachmentError?: boolean;
}>;

function Detail({ label, value }: Readonly<{ label: string; value?: string }>) {
  if (!value) return null;
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function WorkshopDetailsScreen({
  attachmentError = false,
  onOpenAttachment,
  onRetry,
  openingAttachmentId,
  source = 'network',
  status,
  workshop,
}: Props) {
  const [imageStatus, setImageStatus] = useState<
    'loading' | 'loaded' | 'error'
  >('loading');

  if (status === 'loading')
    return <LoadingState message="Carregando workshop" />;
  if (!workshop)
    return (
      <ErrorState
        message="Não foi possível carregar o workshop."
        onRetry={onRetry}
      />
    );

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      {source === 'cache' ? (
        <Text accessibilityRole="alert" style={styles.cachedNotice}>
          Sem conexão. Exibindo os detalhes salvos neste dispositivo.
        </Text>
      ) : null}
      {workshop.imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            accessibilityLabel={`Imagem do workshop ${workshop.title}`}
            contentFit="cover"
            onError={() => setImageStatus('error')}
            onLoad={() => setImageStatus('loaded')}
            source={{ uri: workshop.imageUrl }}
            style={styles.image}
          />
          {imageStatus !== 'loaded' ? (
            <Text accessibilityLiveRegion="polite" style={styles.imageStatus}>
              {imageStatus === 'error'
                ? 'Imagem indisponível'
                : 'Carregando imagem'}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Text accessibilityRole="header" style={styles.title}>
        {workshop.title}
      </Text>
      {workshop.description ? (
        <Text style={styles.description}>{workshop.description}</Text>
      ) : null}

      <View style={styles.panel}>
        <Detail label="Tema" value={workshop.theme} />
        <Detail label="Categoria" value={workshop.category} />
        <Detail label="Data" value={workshop.dateLabel} />
        <Detail label="Horário" value={workshop.timeLabel} />
        <Detail label="Local" value={workshop.location} />
        <Detail label="Modalidade" value={workshop.modality} />
        <Detail label="Valor" value={workshop.priceLabel} />
        <Detail label="Inscrições" value={workshop.registrationPeriodLabel} />
        <Detail label="Vagas" value={workshop.capacityLabel} />
      </View>

      {workshop.responsibleNames?.length ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Responsáveis
          </Text>
          {workshop.responsibleNames.map((name, index) => (
            <Text key={`${name}:${index}`} style={styles.listText}>
              {name}
            </Text>
          ))}
        </View>
      ) : null}

      {workshop.attachments?.length ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Anexos
          </Text>
          {attachmentError ? (
            <Text accessibilityRole="alert" style={styles.attachmentError}>
              Não foi possível abrir o anexo. Tente novamente.
            </Text>
          ) : null}
          {workshop.attachments.map((attachment) => {
            const opening = openingAttachmentId === attachment.id;
            const label = (
              <View style={styles.attachmentContent}>
                <Text style={styles.attachmentText}>{attachment.name}</Text>
                {opening ? (
                  <ActivityIndicator
                    accessibilityLabel={`Abrindo anexo ${attachment.name}`}
                    color={colors.brand}
                  />
                ) : null}
              </View>
            );

            if (!onOpenAttachment) {
              return (
                <View key={attachment.id} style={styles.attachment}>
                  {label}
                </View>
              );
            }

            return (
              <Pressable
                accessibilityLabel={`Abrir anexo ${attachment.name}`}
                accessibilityRole="button"
                accessibilityState={{ busy: opening, disabled: opening }}
                disabled={opening}
                key={attachment.id}
                onPress={() => onOpenAttachment(attachment)}
                style={styles.attachment}
              >
                {label}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {workshop.additionalInformation ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Informações adicionais
          </Text>
          <Text style={styles.listText}>{workshop.additionalInformation}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  cachedNotice: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.label,
    marginBottom: spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radii.xl,
    height: 200,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageStatus: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
    position: 'absolute',
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  detail: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.label,
  },
  detailValue: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
    marginTop: spacing.xxs,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: 20,
    fontWeight: typography.bold,
    marginBottom: spacing.sm,
  },
  listText: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  attachment: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  attachmentText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
  attachmentContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attachmentError: {
    color: colors.danger,
    fontFamily: typography.familyRegular,
    marginBottom: spacing.sm,
  },
});
