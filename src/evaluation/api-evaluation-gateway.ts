import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';

export type EvaluationInput = Readonly<{
  rating: number;
  comment: string | null;
  contentRating: number;
  instructorRating: number;
  organizationRating: number;
}>;
export type EvaluationResult = EvaluationInput &
  Readonly<{ id: string; workshopId: string }>;

export function createApiEvaluationGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
) {
  return {
    async create(
      workshopId: string,
      input: EvaluationInput,
      idempotencyKey: string,
    ): Promise<EvaluationResult> {
      if (!workshopId.trim() || !idempotencyKey.trim() || !valid(input))
        throw new AppError({ category: 'bad_request' });
      const tokens = await tokenStorage.read();
      if (!tokens) throw new AppError({ category: 'unauthorized' });
      const response = await http.request<unknown>({
        path: `/workshops/${encodeURIComponent(workshopId)}/evaluations`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: input,
      });
      if (!isEvaluation(response))
        throw new AppError({
          category: 'unknown',
          technicalMessage: 'Invalid evaluation response.',
        });
      return response;
    },
  };
}
function valid(input: EvaluationInput) {
  return (
    [
      input.rating,
      input.contentRating,
      input.instructorRating,
      input.organizationRating,
    ].every((value) => Number.isInteger(value) && value >= 1 && value <= 5) &&
    (input.comment === null || input.comment.length <= 4000)
  );
}
function isEvaluation(value: unknown): value is EvaluationResult {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<EvaluationResult>;
  return (
    typeof item.id === 'string' &&
    typeof item.workshopId === 'string' &&
    typeof item.rating === 'number' &&
    typeof item.contentRating === 'number' &&
    typeof item.instructorRating === 'number' &&
    typeof item.organizationRating === 'number' &&
    (item.comment === null || typeof item.comment === 'string')
  );
}
