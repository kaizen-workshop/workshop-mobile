import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { describeError } from '@/core/errors';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiCommentGateway, createApiFeedGateway } from '@/feed/data';
import type { PostComment } from '@/feed/domain';
import { getSelectedWorkshop, selectWorkshop } from '@/navigation';
import { createApiPaymentGateway } from '@/payment/data';
import type { PaymentResult } from '@/payment/domain';
import { createApiRegistrationGateway } from '@/registration/data';
import type { RegistrationResult } from '@/registration/domain';
import {
  createApiWorkshopGateway,
  createWorkshopAttachmentOpener,
  createWorkshopCache,
  loadWorkshopDetails,
} from '@/workshop/data';
import type { WorkshopAttachment, WorkshopDetails } from '@/workshop/domain';
import { WorkshopDetailsScreen } from '@/workshop/presentation';

export default function WorkshopDetailsRoute() {
  const environment = useMemo(() => getEnvironment(), []);
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = routeId ?? getSelectedWorkshop()?.id;
  const gateway = useMemo(
    () =>
      createApiWorkshopGateway(
        createAuthenticatedHttpClient(environment),
        createTokenStorage(),
        environment.apiUrl,
      ),
    [environment],
  );
  const attachmentOpener = useMemo(
    () =>
      createWorkshopAttachmentOpener(getEnvironment(), createTokenStorage()),
    [],
  );
  const registrationGateway = useMemo(
    () =>
      createApiRegistrationGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const paymentGateway = useMemo(
    () =>
      createApiPaymentGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const feedGateway = useMemo(
    () =>
      createApiFeedGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const commentGateway = useMemo(
    () =>
      createApiCommentGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const [workshop, setWorkshop] = useState<WorkshopDetails>();
  const [source, setSource] = useState<'network' | 'cache'>('network');
  const [openingAttachmentId, setOpeningAttachmentId] = useState<string>();
  const [attachmentError, setAttachmentError] = useState<boolean | string>(
    false,
  );
  const [registration, setRegistration] = useState<RegistrationResult>();
  const [registrationError, setRegistrationError] = useState<string>();
  const [registering, setRegistering] = useState(false);
  const [registrationKey, setRegistrationKey] = useState(() =>
    Crypto.randomUUID(),
  );
  const [cancellingRegistration, setCancellingRegistration] = useState(false);
  const [cancellationKey, setCancellationKey] = useState(() =>
    Crypto.randomUUID(),
  );
  const [cancellationError, setCancellationError] = useState<string>();
  const registeringRef = useRef(false);
  const cancellingRef = useRef(false);
  const [payment, setPayment] = useState<PaymentResult>();
  const [paymentKey, setPaymentKey] = useState(() => Crypto.randomUUID());
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<boolean | string>(false);
  const payingRef = useRef(false);
  const [discussionStatus, setDiscussionStatus] = useState<
    'loading' | 'error' | 'success' | 'unavailable'
  >('loading');
  const [discussionPostId, setDiscussionPostId] = useState<string>();
  const [comments, setComments] = useState<readonly PostComment[]>([]);
  const [commentUserId, setCommentUserId] = useState('');
  const [commentSending, setCommentSending] = useState(false);
  const [commentError, setCommentError] = useState<boolean | string>(false);
  const pendingComment = useRef<{ content: string; key: string } | undefined>(
    undefined,
  );

  const load = useCallback(async () => {
    if (!id) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const result = await loadDetails(gateway, id);
      setWorkshop(result.data);
      setSource(result.source);
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [gateway, id]);

  const openAttachment = useCallback(
    async (attachment: WorkshopAttachment) => {
      if (!id || openingAttachmentId) return;
      setOpeningAttachmentId(attachment.id);
      setAttachmentError(false);
      try {
        await attachmentOpener.open(id, attachment);
      } catch (cause) {
        setAttachmentError(
          describeError(cause, {
            not_found: 'Este anexo não está mais disponível.',
          }).message,
        );
      } finally {
        setOpeningAttachmentId(undefined);
      }
    },
    [attachmentOpener, id, openingAttachmentId],
  );

  const register = useCallback(async () => {
    if (
      !id ||
      registeringRef.current ||
      (registration && !['CANCELLED', 'REFUNDED'].includes(registration.status))
    )
      return;
    registeringRef.current = true;
    setRegistering(true);
    setRegistrationError(undefined);
    try {
      const created = await registrationGateway.register(id, registrationKey);
      setRegistration(created);
      setPayment(undefined);
      setPaymentKey(Crypto.randomUUID());
    } catch (error) {
      setRegistrationError(
        describeError(error, {
          conflict:
            'Você já possui uma inscrição válida ou este workshop não aceita novas inscrições.',
          not_found: 'Este workshop não está mais disponível para inscrição.',
        }).message,
      );
    } finally {
      registeringRef.current = false;
      setRegistering(false);
    }
  }, [id, registration, registrationGateway, registrationKey]);

  const cancelRegistration = useCallback(async () => {
    if (!registration || cancellingRef.current) return;
    cancellingRef.current = true;
    setCancellingRegistration(true);
    setCancellationError(undefined);
    try {
      setRegistration(
        await registrationGateway.cancel(registration.id, cancellationKey),
      );
      setRegistrationKey(Crypto.randomUUID());
      setCancellationKey(Crypto.randomUUID());
      setPayment(undefined);
      setPaymentKey(Crypto.randomUUID());
    } catch (error) {
      setCancellationError(
        describeError(error, {
          conflict:
            'O cancelamento não é permitido no estado atual da inscrição.',
          not_found: 'Não encontramos esta inscrição. Atualize a tela.',
        }).message,
      );
    } finally {
      cancellingRef.current = false;
      setCancellingRegistration(false);
    }
  }, [cancellationKey, registration, registrationGateway]);

  const createPayment = useCallback(async () => {
    if (!registration || payingRef.current || payment) return;
    payingRef.current = true;
    setPaying(true);
    setPaymentError(false);
    try {
      setPayment(await paymentGateway.create(registration.id, paymentKey));
    } catch (cause) {
      setPaymentError(
        describeError(cause, {
          conflict: 'O pagamento desta inscrição já foi iniciado ou concluído.',
        }).message,
      );
    } finally {
      payingRef.current = false;
      setPaying(false);
    }
  }, [payment, paymentGateway, paymentKey, registration]);

  const [refreshingRegistration, setRefreshingRegistration] = useState(false);
  const refreshRegistration = useCallback(async () => {
    if (!id || refreshingRegistration) return;
    setRefreshingRegistration(true);
    try {
      const current = await registrationGateway.loadCurrent(id);
      if (current) setRegistration(current);
    } catch {
      // Keeping the last known state is better than replacing it with an error.
    } finally {
      setRefreshingRegistration(false);
    }
  }, [id, refreshingRegistration, registrationGateway]);

  const loadDiscussion = useCallback(async () => {
    if (!id) return;
    setDiscussionStatus('loading');
    setCommentError(false);
    try {
      const postId = await feedGateway.findPostIdForWorkshop(id);
      if (!postId) {
        setDiscussionPostId(undefined);
        setComments([]);
        setDiscussionStatus('unavailable');
        return;
      }
      const [page, userId] = await Promise.all([
        commentGateway.load(postId, 0, 50),
        commentGateway.currentUserId(),
      ]);
      setDiscussionPostId(postId);
      setCommentUserId(userId);
      setComments(page.items);
      setDiscussionStatus('success');
    } catch {
      setDiscussionStatus('error');
    }
  }, [commentGateway, feedGateway, id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void loadDetails(gateway, id)
      .then((result) => {
        if (!active) return;
        setWorkshop(result.data);
        setSource(result.source);
        setStatus('success');
      })
      .catch((cause) => {
        if (active) {
          setLoadError(cause);
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, [gateway, id]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return undefined;
      let active = true;
      void registrationGateway
        .loadCurrent(id)
        .then((current) => {
          if (active && current) setRegistration(current);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, [id, registrationGateway]),
  );

  useEffect(() => {
    if (!id) return;
    let active = true;

    void feedGateway
      .findPostIdForWorkshop(id)
      .then(async (postId) => {
        if (!postId) return { postId: undefined, comments: [], userId: '' };
        const [page, userId] = await Promise.all([
          commentGateway.load(postId, 0, 50),
          commentGateway.currentUserId(),
        ]);
        return { postId, comments: page.items, userId };
      })
      .then((discussion) => {
        if (!active) return;
        setDiscussionPostId(discussion.postId);
        setComments(discussion.comments);
        setCommentUserId(discussion.userId);
        setDiscussionStatus(discussion.postId ? 'success' : 'unavailable');
      })
      .catch(() => {
        if (active) setDiscussionStatus('error');
      });

    return () => {
      active = false;
    };
  }, [commentGateway, feedGateway, id]);

  return (
    <WorkshopDetailsScreen
      attachmentError={attachmentError}
      commentError={commentError}
      comments={comments}
      commentSending={commentSending}
      currentUserId={commentUserId}
      discussionStatus={discussionStatus}
      cancellationError={cancellationError}
      cancellingRegistration={cancellingRegistration}
      openingAttachmentId={openingAttachmentId}
      onOpenAttachment={openAttachment}
      onCancelRegistration={cancelRegistration}
      onCreatePayment={createPayment}
      onRefreshRegistration={() => void refreshRegistration()}
      refreshingRegistration={refreshingRegistration}
      onEvaluate={
        // Rule: only a confirmed participant, once the workshop has ended.
        workshop &&
        registration?.status === 'CONFIRMED' &&
        workshop.endDate &&
        workshop.endDate <= toLocalIsoDate(new Date())
          ? () => {
              selectWorkshop({ id: workshop.id, title: workshop.title });
              router.push('/(authenticated)/evaluation');
            }
          : undefined
      }
      onRegister={register}
      onRetry={load}
      onRetryComments={loadDiscussion}
      onSendComment={
        discussionPostId
          ? async (content) => {
              if (commentSending) return false;
              setCommentSending(true);
              setCommentError(false);
              try {
                const normalized = content.trim();
                const operation =
                  pendingComment.current?.content === normalized
                    ? pendingComment.current
                    : { content: normalized, key: Crypto.randomUUID() };
                pendingComment.current = operation;
                const created = await commentGateway.create(
                  discussionPostId,
                  normalized,
                  operation.key,
                );
                setComments((current) => [created, ...current]);
                pendingComment.current = undefined;
                return true;
              } catch (cause) {
                setCommentError(
                  describeError(cause, {
                    forbidden: 'Você não pode comentar neste workshop.',
                    conflict: 'Este comentário já foi enviado.',
                    bad_request:
                      'O comentário não foi aceito. Revise o texto e tente de novo.',
                  }).message,
                );
                return false;
              } finally {
                setCommentSending(false);
              }
            }
          : undefined
      }
      registration={registration}
      registrationError={registrationError}
      registering={registering}
      payment={payment}
      paymentError={paymentError}
      paying={paying}
      source={source}
      status={id ? status : 'error'}
      error={loadError}
      workshop={workshop}
    />
  );
}

async function loadDetails(
  gateway: ReturnType<typeof createApiWorkshopGateway>,
  id: string,
) {
  const userId = await gateway.getCurrentUserId();
  return loadWorkshopDetails({
    id,
    cache: createWorkshopCache({ userId }),
    loadRemote: () => gateway.loadDetails(id),
  });
}

function toLocalIsoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
