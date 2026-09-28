import type { AuthGateway, AuthSession } from '../domain/auth-gateway';

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
      tokens = await tokenStorage.read();
      state = tokens ? 'AUTHENTICATED' : 'UNAUTHENTICATED';
    },
    async login(input: { login: string; password: string }) {
      await apply(await gateway.login(input));
    },
    async changePassword(input: {
      currentPassword: string;
      newPassword: string;
    }) {
      await gateway.changePassword(input);
      state = stateAfterPasswordChange;
    },
    refresh() {
      if (!refreshPromise)
        refreshPromise = (async () => {
          try {
            if (!tokens) throw new Error('No session');
            await apply(await gateway.refresh(tokens.refreshToken));
          } catch (error) {
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
        if (tokens) await gateway.logout(tokens.refreshToken);
      } finally {
        tokens = null;
        state = 'UNAUTHENTICATED';
        stateAfterPasswordChange = 'AUTHENTICATED';
        await tokenStorage.clear();
      }
    },
  };
}
