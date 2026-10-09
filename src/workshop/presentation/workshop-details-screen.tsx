import { useState } from 'react';
import { Image } from 'expo-image';
import {
  Banknote,
  CalendarDays,
  Clock3,
  MapPin,
  MonitorSmartphone,
  Send,
  Tag,
  Users,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { PostComment } from '@/feed/domain';
import { BackHeader, StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';
import type { RegistrationResult } from '@/registration/domain';
import type { PaymentResult } from '@/payment/domain';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';
import type { WorkshopAttachment, WorkshopDetails } from '@/workshop/domain';
import { useWorkshopImageSource } from './use-workshop-image-source';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  workshop?: WorkshopDetails;
  source?: 'network' | 'cache';
  onRetry?: () => void;
  onOpenAttachment?: (attachment: WorkshopAttachment) => void;
  openingAttachmentId?: string;
  attachmentError?: boolean | string;
  registration?: RegistrationResult;
  registrationError?: string;
  registering?: boolean;
  onRegister?: () => void;
  onCancelRegistration?: () => void;
  cancellingRegistration?: boolean;
  cancellationError?: string;
  payment?: PaymentResult;
  paymentError?: boolean | string;
  paying?: boolean;
  onCreatePayment?: () => void;
  onRefreshRegistration?: () => void;
  refreshingRegistration?: boolean;
  onEvaluate?: () => void;
  discussionStatus?: 'loading' | 'error' | 'success' | 'unavailable';
  comments?: readonly PostComment[];
  currentUserId?: string;
  commentSending?: boolean;
  commentError?: boolean | string;
  onRetryComments?: () => void;
  onSendComment?: (content: string) => Promise<boolean> | boolean;
}>;

function Detail({
  Icon,
  label,
  value,
}: Readonly<{
  Icon: ComponentType<{ color: string; size: number }>;
  label: string;
  value?: string;
}>) {
  if (!value) return null;
  return (
    <View style={styles.detail}>
      <Icon color={colors.brand} size={21} />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export function WorkshopDetailsScreen({
  attachmentError = false,
  commentError = false,
  comments = [],
  commentSending = false,
  currentUserId = '',
  discussionStatus,
  cancellationError,
  cancellingRegistration = false,
  onCancelRegistration,
  onCreatePayment,
  onRefreshRegistration,
  refreshingRegistration = false,
  onEvaluate,
  onOpenAttachment,
  onRetry,
  openingAttachmentId,
  onRegister,
  onRetryComments,
  onSendComment,
  registration,
  registrationError,
  registering = false,
  payment,
  paymentError = false,
  paying = false,
  source = 'network',
  status,
  error,
  workshop,
}: Props) {
  const [imageStatus, setImageStatus] = useState<
    'loading' | 'loaded' | 'error'
  >('loading');
  const [commentText, setCommentText] = useState('');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const { refreshImage, source: imageSource } = useWorkshopImageSource(
    workshop?.imageUrl,
  );

  const frame = (node: React.ReactNode) => (
    <StatePage kind="back" eyebrow={'Workshop'} title={'Detalhes'}>
      {node}
    </StatePage>
  );
  if (status === 'loading')
    return frame(<LoadingState message="Carregando workshop" />);
  if (!workshop)
    return frame(
      <ErrorState
        message="Não foi possível carregar o workshop."
        error={error}
        overrides={{ not_found: 'Este workshop não está mais disponível.' }}
        onRetry={onRetry}
      />,
    );

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <BackHeader eyebrow="Workshop" title="Detalhes" />
      {source === 'cache' ? (
        <Text accessibilityRole="alert" style={styles.cachedNotice}>
          Sem conexão. Exibindo os detalhes salvos neste dispositivo.
        </Text>
      ) : null}
      <View style={styles.imageContainer}>
        <Image
          accessibilityLabel={`Imagem do workshop ${workshop.title}`}
          contentFit="cover"
          onError={() => {
            setImageStatus('error');
            refreshImage();
          }}
          onLoad={() => setImageStatus('loaded')}
          source={imageSource}
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

      {workshop.theme ? (
        <View style={styles.themePill}>
          <View style={styles.themeDot} />
          <Text style={styles.themeText}>{workshop.theme}</Text>
        </View>
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        {workshop.title}
      </Text>
      {workshop.description ? (
        <Text style={styles.description}>{workshop.description}</Text>
      ) : null}

      <View style={styles.panel}>
        <Detail Icon={Tag} label="Categoria" value={workshop.category} />
        <Detail Icon={CalendarDays} label="Data" value={workshop.dateLabel} />
        <Detail Icon={Clock3} label="Horário" value={workshop.timeLabel} />
        <Detail Icon={MapPin} label="Local" value={workshop.location} />
        <Detail
          Icon={MonitorSmartphone}
          label="Modalidade"
          value={workshop.modality}
        />
        <Detail Icon={Banknote} label="Valor" value={workshop.priceLabel} />
        <Detail
          Icon={CalendarDays}
          label="Inscrições"
          value={workshop.registrationPeriodLabel}
        />
        <Detail Icon={Users} label="Vagas" value={workshop.capacityLabel} />
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
              {cancellationError}
            </Text>
          ) : null}
          {onCancelRegistration &&
          ['PENDING', 'CONFIRMED', 'WAITING_LIST'].includes(
            registration.status,
          ) ? (
            confirmingCancel ? (
              <View style={styles.cancelConfirm}>
                <Text
                  accessibilityRole="header"
                  style={styles.registrationTitle}
                >
                  Deseja cancelar sua inscrição?
                </Text>
                <Text style={styles.registrationMessage}>
                  {registration.paymentStatus === 'PAID'
                    ? 'Sua participação será cancelada. O reembolso só acontece se o cancelamento for feito com mais de 48 horas de antecedência.'
                    : 'Ao confirmar, sua participação neste workshop será cancelada.'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setConfirmingCancel(false)}
                  style={styles.registrationButton}
                >
                  <Text style={styles.registrationButtonText}>
                    Manter minha inscrição
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    busy: cancellingRegistration,
                    disabled: cancellingRegistration,
                  }}
                  disabled={cancellingRegistration}
                  onPress={() => {
                    setConfirmingCancel(false);
                    onCancelRegistration();
                  }}
                  style={styles.cancellationButton}
                >
                  {cancellingRegistration ? (
                    <ActivityIndicator
                      accessibilityLabel="Cancelando inscrição"
                      color={colors.danger}
                    />
                  ) : (
                    <Text style={styles.cancellationButtonText}>
                      Confirmar cancelamento
                    </Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmingCancel(true)}
                style={styles.cancellationButton}
              >
                <Text style={styles.cancellationButtonText}>
                  Cancelar inscrição
                </Text>
              </Pressable>
            )
          ) : null}
        </View>
      ) : null}

      {onRegister &&
      (!registration ||
        ['CANCELLED', 'REFUNDED'].includes(registration.status)) ? (
        <View style={styles.registrationAction}>
          {registrationError ? (
            <Text accessibilityRole="alert" style={styles.registrationError}>
              {registrationError}
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
            Pagamento{' '}
            {paymentStatusLabel(shownPaymentStatus(payment, registration))}
          </Text>
          <Text style={styles.registrationMessage}>
            {paymentMessage(
              shownPaymentStatus(payment, registration),
              workshop.priceLabel,
            )}
          </Text>
          {shownPaymentStatus(payment, registration) === 'PENDING' &&
          onRefreshRegistration ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: refreshingRegistration,
                disabled: refreshingRegistration,
              }}
              disabled={refreshingRegistration}
              onPress={onRefreshRegistration}
              style={styles.refreshButton}
            >
              {refreshingRegistration ? (
                <ActivityIndicator
                  accessibilityLabel="Atualizando situação"
                  color={colors.brand}
                />
              ) : (
                <Text style={styles.refreshButtonText}>Atualizar situação</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : onCreatePayment && registration?.paymentStatus === 'PENDING' ? (
        <View style={styles.registrationAction}>
          {paymentError ? (
            <Text accessibilityRole="alert" style={styles.registrationError}>
              {errorText(
                paymentError,
                'Não foi possível iniciar o pagamento. Tente novamente.',
              )}
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
              {errorText(
                attachmentError,
                'Não foi possível abrir o anexo. Tente novamente.',
              )}
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
      {onEvaluate ? (
        <Pressable
          accessibilityRole="button"
          onPress={onEvaluate}
          style={styles.evaluationButton}
        >
          <Text style={styles.evaluationButtonText}>Avaliar workshop</Text>
        </Pressable>
      ) : null}
      {discussionStatus ? (
        <View style={styles.commentsSection}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Comentários
          </Text>
          {discussionStatus === 'loading' ? (
            <ActivityIndicator
              accessibilityLabel="Carregando comentários"
              color={colors.brand}
            />
          ) : null}
          {discussionStatus === 'unavailable' ? (
            <Text style={styles.commentsHint}>
              Os comentários estarão disponíveis quando houver uma publicação
              vinculada a este workshop.
            </Text>
          ) : null}
          {discussionStatus === 'error' ? (
            <View style={styles.commentsError}>
              <Text style={styles.commentsHint}>
                Não foi possível carregar os comentários.
              </Text>
              {onRetryComments ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onRetryComments}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {discussionStatus === 'success' ? (
            <>
              {comments.length ? (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentCard}>
                    <Text style={styles.commentAuthor}>
                      {comment.userId === currentUserId
                        ? 'Você'
                        : 'Participante'}
                    </Text>
                    <Text style={styles.commentBody}>{comment.content}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.commentsHint}>
                  Seja a primeira pessoa a comentar.
                </Text>
              )}
              {onSendComment ? (
                <View style={styles.commentComposer}>
                  <TextInput
                    accessibilityLabel="Novo comentário"
                    maxLength={4000}
                    multiline
                    onChangeText={setCommentText}
                    placeholder="Escreva um comentário"
                    placeholderTextColor={colors.placeholder}
                    style={styles.commentInput}
                    value={commentText}
                  />
                  {commentError ? (
                    <Text
                      accessibilityRole="alert"
                      style={styles.registrationError}
                    >
                      {errorText(
                        commentError,
                        'Não foi possível publicar o comentário.',
                      )}
                    </Text>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      busy: commentSending,
                      disabled: commentSending || !commentText.trim(),
                    }}
                    disabled={commentSending || !commentText.trim()}
                    onPress={async () => {
                      if (await onSendComment(commentText)) setCommentText('');
                    }}
                    style={[
                      styles.commentButton,
                      (commentSending || !commentText.trim()) &&
                        styles.buttonDisabled,
                    ]}
                  >
                    <Send color={colors.onBrand} size={18} />
                    <Text style={styles.registrationButtonText}>
                      {commentSending ? 'Publicando...' : 'Publicar'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : null}
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
    return registration.waitingListPosition
      ? `O workshop está cheio. Sua posição na lista é ${registration.waitingListPosition}. Você será avisado se surgir uma vaga.`
      : 'O workshop está cheio. Você será avisado se surgir uma vaga.';
  if (
    registration.status === 'CANCELLED' &&
    registration.paymentStatus === 'PAID'
  )
    return 'A inscrição foi cancelada, mas o pagamento não foi reembolsado conforme a regra de prazo.';
  if (
    registration.status === 'CANCELLED' &&
    registration.paymentStatus === 'REFUNDED'
  )
    return 'A inscrição foi cancelada e o reembolso foi processado.';
  if (registration.status === 'CANCELLED')
    return 'A inscrição foi cancelada com sucesso.';
  if (registration.status === 'REFUNDED')
    return 'A inscrição foi cancelada e o reembolso foi processado.';
  return 'Sua inscrição está pendente de confirmação.';
}

/** The registration is the source of truth once it moves past the first answer. */
function shownPaymentStatus(
  payment: PaymentResult,
  registration?: RegistrationResult,
): PaymentResult['status'] {
  const latest = registration?.paymentStatus;
  return latest && latest !== 'EXEMPT' ? latest : payment.status;
}

function paymentMessage(status: PaymentResult['status'], priceLabel?: string) {
  if (status === 'PENDING')
    return `${priceLabel ? `Pagamento de ${priceLabel} registrado. ` : 'Pagamento registrado. '}Sua vaga está reservada enquanto aguardamos a confirmação. Você receberá um aviso quando for confirmado; toque em "Atualizar situação" para conferir agora.`;
  if (status === 'PAID')
    return 'Pagamento confirmado. Sua inscrição está garantida.';
  if (status === 'DECLINED')
    return 'O pagamento foi recusado e a vaga foi liberada. Você pode se inscrever novamente.';
  return 'O estado do pagamento foi atualizado.';
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

function errorText(error: boolean | string, fallback: string) {
  return typeof error === 'string' ? error : fallback;
}

const styles = StyleSheet.create({
  cancelConfirm: { gap: spacing.sm },
  refreshButton: {
    alignItems: 'center',
    borderColor: colors.brand,
    borderRadius: radii.xl,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: sizes.touchTarget,
  },
  refreshButtonText: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
  page: {
    backgroundColor: colors.background,
  },
  content: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    width: '100%',
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
    height: 220,
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
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  detail: {
    alignItems: 'center',
    borderBottomColor: colors.surface3,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    fontWeight: typography.medium,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
    marginTop: spacing.xxs,
  },
  themePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  themeDot: {
    backgroundColor: colors.brand,
    borderRadius: radii.full,
    height: 6,
    width: 6,
  },
  themeText: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.caption,
    textTransform: 'uppercase',
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
  evaluationButton: {
    alignItems: 'center',
    borderColor: colors.brand,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: sizes.touchTarget,
  },
  evaluationButtonText: {
    color: colors.brand,
    fontFamily: typography.familyBold,
  },
  commentsSection: {
    borderTopColor: colors.surface3,
    borderTopWidth: 1,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  commentsHint: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
  },
  commentsError: { gap: spacing.sm },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: colors.brand,
    borderRadius: radii.lg,
    borderWidth: 1,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  retryText: { color: colors.brand, fontFamily: typography.familyBold },
  commentCard: {
    backgroundColor: colors.surface,
    borderColor: colors.surface3,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  commentAuthor: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.bodySmall,
  },
  commentBody: {
    color: colors.text,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  commentDate: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  commentComposer: { marginTop: spacing.md },
  commentInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    color: colors.text,
    minHeight: 100,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  commentButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: sizes.touchTarget,
  },
  buttonDisabled: { opacity: 0.55 },
});
