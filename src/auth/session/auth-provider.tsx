import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  login(input: { login: string; password: string }): Promise<void>;
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
  useEffect(() => {
    void controller.restore().then(() => setState(controller.getState()));
  }, [controller]);
  const sync = async (operation: () => Promise<void>) => {
    await operation();
    setState(controller.getState());
  };
  return (
    <AuthContext.Provider
      value={{
        state,
        login: (input) => sync(() => controller.login(input)),
        refresh: () => sync(() => controller.refresh()),
        logout: () => sync(() => controller.logout()),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
