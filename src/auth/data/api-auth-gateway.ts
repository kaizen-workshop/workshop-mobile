import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';

import type { AuthGateway, AuthSession } from '../domain/auth-gateway';

type TokenResponse = Readonly<{
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  mustChangePassword: boolean;
}>;

type ProfileResponse = Readonly<{
  themes: readonly unknown[];
}>;

export function createApiAuthGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): AuthGateway {
  const sessionFrom = async (value: unknown): Promise<AuthSession> => {
    if (!isTokenResponse(value)) throw invalidResponse('token');

    let requiresOnboarding = false;
    if (!value.mustChangePassword) {
      const profile = await http.request<unknown>({
        path: '/users/me',
        headers: { Authorization: `Bearer ${value.accessToken}` },
      });
      if (!isProfileResponse(profile)) throw invalidResponse('profile');
      requiresOnboarding = profile.themes.length === 0;
    }

    return {
      accessToken: value.accessToken,
      refreshToken: value.refreshToken,
      mustChangePassword: value.mustChangePassword,
      requiresOnboarding,
    };
  };

  return {
    async login(input) {
      const response = await http.request<unknown>({
        path: '/auth/login',
        method: 'POST',
        body: input,
      });
      return sessionFrom(response);
    },
    async refresh(refreshToken) {
      const response = await http.request<unknown>({
        path: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      });
      return sessionFrom(response);
    },
    async changePassword(input) {
      const tokens = await tokenStorage.read();
      if (!tokens) throw new AppError({ category: 'unauthorized' });
      await http.request<void>({
        path: '/auth/change-password',
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        body: input,
      });
    },
    async requestPasswordRecovery(email) {
      await http.request<void>({
        path: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      });
    },
    async resetPassword(input) {
      await http.request<void>({
        path: '/auth/reset-password',
        method: 'POST',
        body: { token: input.code, newPassword: input.password },
      });
    },
    async logout(refreshToken) {
      await http.request<void>({
        path: '/auth/logout',
        method: 'POST',
        body: { refreshToken },
      });
    },
  };
}

function isTokenResponse(value: unknown): value is TokenResponse {
  if (!value || typeof value !== 'object') return false;
  const token = value as Partial<TokenResponse>;
  return (
    typeof token.accessToken === 'string' &&
    token.accessToken.length > 0 &&
    typeof token.refreshToken === 'string' &&
    token.refreshToken.length > 0 &&
    token.tokenType === 'Bearer' &&
    typeof token.mustChangePassword === 'boolean'
  );
}

function isProfileResponse(value: unknown): value is ProfileResponse {
  return (
    !!value &&
    typeof value === 'object' &&
    'themes' in value &&
    Array.isArray(value.themes)
  );
}

function invalidResponse(resource: string) {
  return new AppError({
    category: 'unknown',
    technicalMessage: `Invalid authentication ${resource} response.`,
  });
}
