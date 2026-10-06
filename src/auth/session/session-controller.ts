import type { AuthGateway, AuthSession } from '../domain/auth-gateway';
import { AppError } from '@/core/errors';
import { readJwtSession } from '@/core/secure-storage';

type Tokens = Readonly<{ accessToken: string; refreshToken: string }>;
type TokenStorage = Readonly<{
  read(): Promise<Tokens | null>;
  save(tokens: Tokens): Promise<void>;
  clear(): Promise<void>;
}>;
export type AuthState =
  | 'UNAUTHENTICATED'
  | 'REQUIRES_PASSWORD_CHANGE'
  | 'REQUIRES_ONBOARDING'
  | 'AUTHENTICATED';

export function createSessionController(
  gateway: AuthGateway,
  tokenStorage: TokenStorage,
  beforeLogout?: () => Promise<void>,
) {
  let tokens: Tokens | null = null;
  let state: AuthState = 'UNAUTHENTICATED';
  let stateAfterPasswordChange: AuthState = 'AUTHENTICATED';
  let refreshPromise: Promise<void> | null = null;
  const apply = async (session: AuthSession) => {
    tokens = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };
    await tokenStorage.save(tokens);
    stateAfterPasswordChange = session.requiresOnboarding
      ? 'REQUIRES_ONBOARDING'
      : 'AUTHENTICATED';
    state = session.mustChangePassword
      ? 'REQUIRES_PASSWORD_CHANGE'
      : stateAfterPasswordChange;
  };
  return {
    getState: () => state,
    async restore() {
      const stored = await tokenStorage.read();
      if (!stored) {
        tokens = null;
        state = 'UNAUTHENTICATED';
        return;
      }
      try {
        await apply(await gateway.refresh(stored.refreshToken));
      } catch (error) {
        const localSession = readJwtSession(stored.accessToken);
        if (
          isConnectivityError(error) &&
          localSession &&
          localSession.expiresAt > Date.now()
        ) {
          tokens = stored;
          state = localSession.mustChangePassword
            ? 'REQUIRES_PASSWORD_CHANGE'
            : localSession.requiresOnboarding
              ? 'REQUIRES_ONBOARDING'
              : 'AUTHENTICATED';
          return;
        }
        tokens = null;
        state = 'UNAUTHENTICATED';
        stateAfterPasswordChange = 'AUTHENTICATED';
        await tokenStorage.clear();
        throw error;
      }
    },
    async login(input: { login: string; password: string }) {
      await apply(await gateway.login(input));
    },
    async changePassword(input: {
      currentPassword: string;
      newPassword: string;
    }) {
      await gateway.changePassword(input);
      tokens = null;
      state = 'UNAUTHENTICATED';
      stateAfterPasswordChange = 'AUTHENTICATED';
      await tokenStorage.clear();
    },
    completeOnboarding() {
      if (state === 'REQUIRES_ONBOARDING') state = 'AUTHENTICATED';
    },
    refresh() {
      if (!refreshPromise)
        refreshPromise = (async () => {
          try {
            const current = await tokenStorage.read();
            if (!current) throw new Error('No session');
            await apply(await gateway.refresh(current.refreshToken));
          } catch (error) {
            if (isConnectivityError(error)) throw error;
            tokens = null;
            state = 'UNAUTHENTICATED';
            await tokenStorage.clear();
            throw error;
          } finally {
            refreshPromise = null;
          }
        })();
      return refreshPromise;
    },
    async logout() {
      try {
        const current = await tokenStorage.read();
        if (beforeLogout) {
          try {
            await beforeLogout();
          } catch {
            // Session revocation and local cleanup must still continue.
          }
        }
        if (current) await gateway.logout(current.refreshToken);
      } finally {
        tokens = null;
        state = 'UNAUTHENTICATED';
        stateAfterPasswordChange = 'AUTHENTICATED';
        await tokenStorage.clear();
      }
    },
    invalidate() {
      tokens = null;
      state = 'UNAUTHENTICATED';
      stateAfterPasswordChange = 'AUTHENTICATED';
    },
  };
}

function isConnectivityError(error: unknown) {
  return (
    error instanceof AppError &&
    (error.category === 'network' || error.category === 'timeout')
  );
}
