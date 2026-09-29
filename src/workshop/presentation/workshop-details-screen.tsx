import { useState } from 'react';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ErrorState, LoadingState } from '@/shared/presentation';
import type { RegistrationResult } from '@/registration/domain';
import type { PaymentResult } from '@/payment/domain';
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
  registration?: RegistrationResult;
  registrationError?: 'conflict' | 'error';
  registering?: boolean;
  onRegister?: () => void;
  onCancelRegistration?: () => void;
  cancellingRegistration?: boolean;
  cancellationError?: 'conflict' | 'error';
  payment?: PaymentResult;
  paymentError?: boolean;
  paying?: boolean;
  onCreatePayment?: () => void;
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
  cancellationError,
  cancellingRegistration = false,
  onCancelRegistration,
  onCreatePayment,
  onOpenAttachment,
  onRetry,
  openingAttachmentId,
  onRegister,
  registration,
  registrationError,
  registering = false,
  payment,
  paymentError = false,
  paying = false,
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

      {registration ? (
        <View
          accessibilityLiveRegion="polite"
          style={styles.registrationResult}
        >
          <Text accessibilityRole="header" style={styles.registrationTitle}>
            {registrationTitle(registration)}
          </Text>
          <Text style={styles.registrationMessage}>
            {registrationMessage(registration)}
          </Text>
          {cancellationError ? (
            <Text accessibilityRole="alert" style={styles.registrationError}>
              {cancellationError === 'conflict'
                ? 'O cancelamento não é permitido no estado atual da inscrição.'
                : 'Não foi possível cancelar a inscrição. Tente novamente.'}
            </Text>
          ) : null}
          {onCancelRegistration &&
          ['PENDING', 'CONFIRMED', 'WAITING_LIST'].includes(
            registration.status,
          ) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: cancellingRegistration,
                disabled: cancellingRegistration,
              }}
              disabled={cancellingRegistration}
              onPress={() =>
                Alert.alert(
                  'Cancelar inscrição',
                  'Tem certeza de que deseja cancelar esta inscrição?',
                  [
                    { text: 'Manter inscrição', style: 'cancel' },
                    {
                      text: 'Cancelar inscrição',
                      style: 'destructive',
                      onPress: onCancelRegistration,
                    },
                  ],
                )
              }
              style={styles.cancellationButton}
            >
              {cancellingRegistration ? (
                <ActivityIndicator
                  accessibilityLabel="Cancelando inscrição"
                  color={colors.danger}
                />
              ) : (
                <Text style={styles.cancellationButtonText}>
                  Cancelar inscrição
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {onRegister &&
      (!registration ||
        ['CANCELLED', 'REFUNDED'].includes(registration.status)) ? (
        <View style={styles.registrationAction}>
          {registrationError ? (
            <Text accessibilityRole="alert" style={styles.registrationError}>
              {registrationError === 'conflict'
                ? 'Você já possui uma inscrição válida ou este workshop não aceita novas inscrições.'
                : 'Não foi possível realizar a inscrição. Tente novamente.'}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: registering, disabled: registering }}
            disabled={registering}
            onPress={onRegister}
            style={styles.registrationButton}
          >
            {registering ? (
              <ActivityIndicator
                accessibilityLabel="Realizando inscrição"
                color={colors.onBrand}
              />
            ) : (
              <Text style={styles.registrationButtonText}>
                {registration ? 'Inscrever-se novamente' : 'Inscrever-se'}
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {payment ? (
        <View accessibilityLiveRegion="polite" style={styles.paymentResult}>
          <Text accessibilityRole="header" style={styles.registrationTitle}>
            Pagamento {paymentStatusLabel(payment.status)}
          </Text>
          <Text style={styles.registrationMessage}>
            {payment.status === 'PENDING'
              ? 'A solicitação foi criada e aguarda confirmação.'
              : 'O estado do pagamento foi atualizado.'}
          </Text>
        </View>
      ) : onCreatePayment && registration?.paymentStatus === 'PENDING' ? (
        <View style={styles.registrationAction}>
          {paymentError ? (
            <Text accessibilityRole="alert" style={styles.registrationError}>
              Não foi possível iniciar o pagamento. Tente novamente.
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: paying, disabled: paying }}
            disabled={paying}
            onPress={onCreatePayment}
            style={styles.registrationButton}
          >
            {paying ? (
              <ActivityIndicator
                accessibilityLabel="Iniciando pagamento"
                color={colors.onBrand}
              />
            ) : (
              <Text style={styles.registrationButtonText}>
                Iniciar pagamento
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}

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

function registrationTitle(registration: RegistrationResult) {
  return {
    PENDING: 'Inscrição pendente',
    CONFIRMED: 'Inscrição confirmada',
    WAITING_LIST: 'Você entrou na lista de espera',
    CANCELLED: 'Inscrição cancelada',
    REFUNDED: 'Inscrição reembolsada',
  }[registration.status];
}

function registrationMessage(registration: RegistrationResult) {
  if (registration.status === 'CONFIRMED')
    return 'Sua participação está confirmada.';
  if (registration.status === 'WAITING_LIST')
    return 'O workshop está cheio. Você será avisado se surgir uma vaga.';
  if (
    registration.status === 'CANCELLED' &&
    registration.paymentStatus === 'PAID'
  )
    return 'A inscrição foi cancelada, mas o pagamento não foi reembolsado conforme a regra de prazo.';
  if (registration.status === 'CANCELLED')
    return 'A inscrição foi cancelada com sucesso.';
  if (registration.status === 'REFUNDED')
    return 'A inscrição foi cancelada e o reembolso foi processado.';
  return 'Sua inscrição está pendente de confirmação.';
}

function paymentStatusLabel(status: PaymentResult['status']) {
  return {
    PENDING: 'pendente',
    PAID: 'confirmado',
    DECLINED: 'recusado',
    CANCELLED: 'cancelado',
    REFUNDED: 'reembolsado',
    EXEMPT: 'isento',
  }[status];
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
  registrationAction: {
    marginTop: spacing.lg,
  },
  registrationButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  registrationButtonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
  registrationError: {
    color: colors.danger,
    fontFamily: typography.familyRegular,
    marginBottom: spacing.sm,
  },
  registrationResult: {
    backgroundColor: colors.surface,
    borderColor: colors.brand,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  registrationTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: 18,
    fontWeight: typography.bold,
  },
  registrationMessage: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    marginTop: spacing.xs,
  },
  cancellationButton: {
    alignItems: 'center',
    borderColor: colors.danger,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  cancellationButtonText: {
    color: colors.danger,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
  paymentResult: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
});
