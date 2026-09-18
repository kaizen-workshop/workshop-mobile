import { AppError } from '@/core/errors';
import type { AuthGateway } from '../domain/auth-gateway';
const unavailable = () =>
  Promise.reject(
    new AppError({ category: 'unknown', code: 'AUTH_INTEGRATION_UNAVAILABLE' }),
  );
export const unavailableAuthGateway: AuthGateway = {
  login: unavailable,
  refresh: unavailable,
  changePassword: unavailable,
  requestPasswordRecovery: unavailable,
  resetPassword: unavailable,
  logout: unavailable,
};
