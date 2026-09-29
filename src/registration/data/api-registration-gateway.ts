import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import { paymentStatuses } from '@/payment/domain';
import {
  registrationStatuses,
  type RegistrationResult,
} from '@/registration/domain';

export type RegistrationGateway = Readonly<{
  loadCurrent(workshopId: string): Promise<RegistrationResult | null>;
  register(
    workshopId: string,
    idempotencyKey: string,
  ): Promise<RegistrationResult>;
  cancel(registrationId: string): Promise<RegistrationResult>;
}>;

export function createApiRegistrationGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): RegistrationGateway {
  const authenticated = async (
    path: string,
    method = 'GET',
    headers: Record<string, string> = {},
  ) => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    return http.request<unknown>({
      path,
      ...(method === 'GET' ? {} : { method }),
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        ...headers,
      },
    });
  };

  return {
    async loadCurrent(workshopId) {
      if (!workshopId.trim()) throw new AppError({ category: 'bad_request' });
      try {
        const response = await authenticated(
          `/workshops/${encodeURIComponent(workshopId)}/registrations/me`,
        );
        return mapRegistration(response);
      } catch (error) {
        if (error instanceof AppError && error.category === 'not_found')
          return null;
        throw error;
      }
    },
    async register(workshopId, idempotencyKey) {
      if (!workshopId.trim() || !idempotencyKey.trim())
        throw new AppError({ category: 'bad_request' });
      const response = await authenticated(
        `/workshops/${encodeURIComponent(workshopId)}/registrations`,
        'POST',
        { 'Idempotency-Key': idempotencyKey },
      );
      return mapRegistration(response);
    },
    async cancel(registrationId) {
      if (!registrationId.trim())
        throw new AppError({ category: 'bad_request' });
      const response = await authenticated(
        `/registrations/${encodeURIComponent(registrationId)}/cancel`,
        'PATCH',
      );
      return mapRegistration(response);
    },
  };
}

function mapRegistration(value: unknown): RegistrationResult {
  if (!isRegistrationResponse(value)) throw invalidResponse();
  return {
    id: value.id,
    workshopId: value.workshopId,
    status: value.status,
    paymentStatus: value.paymentStatus,
    ...(value.waitingListPosition === null
      ? {}
      : { waitingListPosition: value.waitingListPosition }),
  };
}

function isRegistrationResponse(
  value: unknown,
): value is RegistrationResult & { waitingListPosition: number | null } {
  if (!value || typeof value !== 'object') return false;
  const registration = value as Partial<RegistrationResult>;
  return (
    typeof registration.id === 'string' &&
    typeof registration.workshopId === 'string' &&
    registration.status !== undefined &&
    registrationStatuses.includes(registration.status) &&
    registration.paymentStatus !== undefined &&
    paymentStatuses.includes(registration.paymentStatus) &&
    ('waitingListPosition' in registration
      ? registration.waitingListPosition === null ||
        (typeof registration.waitingListPosition === 'number' &&
          registration.waitingListPosition >= 1)
      : true)
  );
}

function invalidResponse() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Invalid registration response.',
  });
}
