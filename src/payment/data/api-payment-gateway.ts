import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import { paymentStatuses, type PaymentResult } from '@/payment/domain';

export type PaymentGateway = Readonly<{
  create(
    registrationId: string,
    idempotencyKey: string,
  ): Promise<PaymentResult>;
}>;

export function createApiPaymentGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): PaymentGateway {
  return {
    async create(registrationId, idempotencyKey) {
      if (!registrationId.trim() || !idempotencyKey.trim())
        throw new AppError({ category: 'bad_request' });
      const tokens = await tokenStorage.read();
      if (!tokens) throw new AppError({ category: 'unauthorized' });
      const response = await http.request<unknown>({
        path: `/registrations/${encodeURIComponent(registrationId)}/payments`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Idempotency-Key': idempotencyKey,
        },
      });
      if (!isPaymentResponse(response)) throw invalidResponse();
      return {
        id: response.id,
        registrationId: response.registrationId,
        amount: response.amount,
        status: response.status,
        method: response.method,
      };
    },
  };
}

function isPaymentResponse(value: unknown): value is PaymentResult {
  if (!value || typeof value !== 'object') return false;
  const payment = value as Partial<PaymentResult>;
  return (
    typeof payment.id === 'string' &&
    typeof payment.registrationId === 'string' &&
    typeof payment.amount === 'number' &&
    payment.status !== undefined &&
    paymentStatuses.includes(payment.status) &&
    typeof payment.method === 'string'
  );
}

function invalidResponse() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Invalid payment response.',
  });
}
