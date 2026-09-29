import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AuthGateway } from '../domain/auth-gateway';
import { createSessionController, type AuthState } from './session-controller';

type Tokens = Readonly<{ accessToken: string; refreshToken: string }>;
type TokenStorage = Readonly<{
  read(): Promise<Tokens | null>;
  save(tokens: Tokens): Promise<void>;
  clear(): Promise<void>;
}>;
type AuthContextValue = Readonly<{
  state: AuthState;
  isRestoring: boolean;
  login(input: { login: string; password: string }): Promise<void>;
  changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;
  refresh(): Promise<void>;
  logout(): Promise<void>;
}>;
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  gateway,
  tokenStorage,
  children,
}: {
  gateway: AuthGateway;
  tokenStorage: TokenStorage;
  children: ReactNode;
}) {
  const controller = useMemo(
    () => createSessionController(gateway, tokenStorage),
    [gateway, tokenStorage],
  );
  const [state, setState] = useState<AuthState>('UNAUTHENTICATED');
  const [isRestoring, setIsRestoring] = useState(true);
  useEffect(() => {
    let mounted = true;
    void controller
      .restore()
      .catch(() => undefined)
      .finally(() => {
        if (!mounted) return;
        setState(controller.getState());
        setIsRestoring(false);
      });
    return () => {
      mounted = false;
    };
  }, [controller]);
  const sync = useCallback(
    async (operation: () => Promise<void>) => {
      try {
        await operation();
      } finally {
        setState(controller.getState());
      }
    },
    [controller],
  );
  const login = useCallback(
    (input: { login: string; password: string }) =>
      sync(() => controller.login(input)),
    [controller, sync],
  );
  const changePassword = useCallback(
    (input: { currentPassword: string; newPassword: string }) =>
      sync(() => controller.changePassword(input)),
    [controller, sync],
  );
  const refresh = useCallback(
    () => sync(() => controller.refresh()),
    [controller, sync],
  );
  const logout = useCallback(
    () => sync(() => controller.logout()),
    [controller, sync],
  );
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      state,
      isRestoring,
      login,
      changePassword,
      refresh,
      logout,
    }),
    [changePassword, isRestoring, login, logout, refresh, state],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
