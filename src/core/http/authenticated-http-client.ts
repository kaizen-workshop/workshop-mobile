import type { EnvironmentConfig } from '@/core/config';
import { AppError } from '@/core/errors';
import {
  createTokenStorage,
  type SessionTokens,
  type TokenStorage,
} from '@/core/secure-storage';

import {
  createHttpClient,
  type HttpClient,
  type HttpRequest,
} from './http-client';

type TokenResponse = SessionTokens &
  Readonly<{
    tokenType: string;
    mustChangePassword: boolean;
  }>;

let refreshPromise: Promise<SessionTokens> | null = null;

export function createAuthenticatedHttpClient(
  config: EnvironmentConfig,
  tokenStorage: TokenStorage = createTokenStorage(),
  http: HttpClient = createHttpClient(config),
): HttpClient {
  return {
    async request<T>(request: HttpRequest): Promise<T> {
      try {
        return await http.request<T>(request);
      } catch (error) {
        if (!isUnauthorized(error) || !hasBearerToken(request.headers)) {
          throw error;
        }

        const storedTokens = await tokenStorage.read();
        if (!storedTokens) throw error;

        const requestToken = readBearerToken(request.headers);
        if (requestToken !== storedTokens.accessToken) {
          return retry<T>(http, request, storedTokens.accessToken);
        }

        let refreshed: SessionTokens;
        try {
          refreshed = await refreshTokens(http, tokenStorage, storedTokens);
        } catch (refreshError) {
          if (isUnauthorized(refreshError)) await tokenStorage.clear();
          throw refreshError;
        }

        try {
          return await retry<T>(http, request, refreshed.accessToken);
        } catch (retryError) {
          if (isUnauthorized(retryError)) await tokenStorage.clear();
          throw retryError;
        }
      }
    },
  };
}

export async function refreshStoredSession(
  config: EnvironmentConfig,
  tokenStorage: TokenStorage = createTokenStorage(),
  http: HttpClient = createHttpClient(config),
) {
  const tokens = await tokenStorage.read();
  if (!tokens) throw new AppError({ category: 'unauthorized' });
  try {
    return await refreshTokens(http, tokenStorage, tokens);
  } catch (error) {
    if (isUnauthorized(error)) await tokenStorage.clear();
    throw error;
  }
}

async function refreshTokens(
  http: HttpClient,
  tokenStorage: TokenStorage,
  tokens: SessionTokens,
) {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const current = await tokenStorage.read();
      if (!current) throw new AppError({ category: 'unauthorized' });
      if (current.refreshToken !== tokens.refreshToken) return current;

      const response = await http.request<unknown>({
        path: '/auth/refresh',
        method: 'POST',
        body: { refreshToken: current.refreshToken },
      });
      if (!isTokenResponse(response)) {
        throw new AppError({
          category: 'unknown',
          technicalMessage: 'Invalid refresh token response.',
        });
      }
      const refreshed = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
      await tokenStorage.save(refreshed);
      return refreshed;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function retry<T>(http: HttpClient, request: HttpRequest, accessToken: string) {
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  return http.request<T>({ ...request, headers });
}

function hasBearerToken(headers?: HeadersInit) {
  return readBearerToken(headers) !== null;
}

function readBearerToken(headers?: HeadersInit) {
  const value = new Headers(headers).get('Authorization');
  return value?.startsWith('Bearer ') ? value.slice(7) : null;
}

function isUnauthorized(error: unknown): error is AppError {
  return error instanceof AppError && error.category === 'unauthorized';
}

function isTokenResponse(value: unknown): value is TokenResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Partial<TokenResponse>;
  return (
    typeof response.accessToken === 'string' &&
    response.accessToken.length > 0 &&
    typeof response.refreshToken === 'string' &&
    response.refreshToken.length > 0 &&
    response.tokenType === 'Bearer' &&
    typeof response.mustChangePassword === 'boolean'
  );
}
