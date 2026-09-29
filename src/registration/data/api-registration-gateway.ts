import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import { paymentStatuses } from '@/payment/domain';
import {
  registrationStatuses,
  type RegistrationResult,
} from '@/registration/domain';

export type RegistrationGateway = Readonly<{
  register(workshopId: string): Promise<RegistrationResult>;
}>;

export function createApiRegistrationGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): RegistrationGateway {
  return {
    async register(workshopId) {
      if (!workshopId.trim()) throw new AppError({ category: 'bad_request' });
      const tokens = await tokenStorage.read();
      if (!tokens) throw new AppError({ category: 'unauthorized' });
      const response = await http.request<unknown>({
        path: `/workshops/${encodeURIComponent(workshopId)}/registrations`,
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
      if (!isRegistrationResponse(response)) throw invalidResponse();
      return {
        id: response.id,
        workshopId: response.workshopId,
        status: response.status,
        paymentStatus: response.paymentStatus,
      };
    },
  };
}

function isRegistrationResponse(value: unknown): value is RegistrationResult {
  if (!value || typeof value !== 'object') return false;
  const registration = value as Partial<RegistrationResult>;
  return (
    typeof registration.id === 'string' &&
    typeof registration.workshopId === 'string' &&
    registrationStatuses.includes(registration.status as never) &&
    paymentStatuses.includes(registration.paymentStatus as never)
  );
}

function invalidResponse() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Invalid registration response.',
  });
}
