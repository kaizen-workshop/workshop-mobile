import { useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useMemo, useRef, useState } from 'react';
import { getEnvironment } from '@/core/config';
import { AppError } from '@/core/errors';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiEvaluationGateway, EvaluationScreen } from '@/evaluation';
import { getSelectedWorkshop } from '@/navigation';
export default function EvaluationRoute() {
  const params = useLocalSearchParams<{ id?: string; title?: string }>();
  const selected = getSelectedWorkshop();
  const id = params.id ?? selected?.id ?? '';
  const title = params.title ?? selected?.title;
  const gateway = useMemo(
    () =>
      createApiEvaluationGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<'ineligible' | 'error'>();
  const pendingEvaluation = useRef<
    { fingerprint: string; key: string } | undefined
  >(undefined);
  return (
    <EvaluationScreen
      workshopTitle={title ?? 'Workshop'}
      submitting={submitting}
      submitted={submitted}
      error={error}
      onSubmit={async (input) => {
        if (submitting) return;
        setSubmitting(true);
        setError(undefined);
        try {
          const fingerprint = JSON.stringify(input);
          const operation =
            pendingEvaluation.current?.fingerprint === fingerprint
              ? pendingEvaluation.current
              : { fingerprint, key: Crypto.randomUUID() };
          pendingEvaluation.current = operation;
          await gateway.create(id, input, operation.key);
          pendingEvaluation.current = undefined;
          setSubmitted(true);
        } catch (cause) {
          setError(
            cause instanceof AppError &&
              ['conflict', 'forbidden', 'not_found'].includes(cause.category)
              ? 'ineligible'
              : 'error',
          );
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
