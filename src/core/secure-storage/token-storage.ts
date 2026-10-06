import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type SessionTokens = Readonly<{
  accessToken: string;
  refreshToken: string;
}>;
export type SecureStoreAdapter = Pick<
  typeof SecureStore,
  'getItemAsync' | 'setItemAsync' | 'deleteItemAsync'
>;
export type TokenStorage = Readonly<{
  read(): Promise<SessionTokens | null>;
  save(tokens: SessionTokens): Promise<void>;
  clear(): Promise<void>;
  subscribeToClear?(listener: () => void): () => void;
}>;
const accessTokenKey = 'workshop.accessToken';
const refreshTokenKey = 'workshop.refreshToken';
let webTokens: SessionTokens | null = null;
const clearListeners = new Set<() => void>();

function notifyClear() {
  clearListeners.forEach((listener) => listener());
}

function subscribeToClear(listener: () => void) {
  clearListeners.add(listener);
  return () => clearListeners.delete(listener);
}

export function createTokenStorage(
  store?: SecureStoreAdapter,
  platform: typeof Platform.OS = Platform.OS,
): TokenStorage {
  if (!store && platform === 'web') {
    return {
      async read() {
        return webTokens;
      },
      async save(tokens) {
        webTokens = tokens;
      },
      async clear() {
        webTokens = null;
        notifyClear();
      },
      subscribeToClear,
    };
  }

  const secureStore = store ?? SecureStore;
  return {
    async read() {
      const [accessToken, refreshToken] = await Promise.all([
        secureStore.getItemAsync(accessTokenKey),
        secureStore.getItemAsync(refreshTokenKey),
      ]);
      return accessToken && refreshToken ? { accessToken, refreshToken } : null;
    },
    async save(tokens) {
      await secureStore.setItemAsync(accessTokenKey, tokens.accessToken);
      await secureStore.setItemAsync(refreshTokenKey, tokens.refreshToken);
    },
    async clear() {
      await Promise.all([
        secureStore.deleteItemAsync(accessTokenKey),
        secureStore.deleteItemAsync(refreshTokenKey),
      ]);
      notifyClear();
    },
    subscribeToClear,
  };
}
