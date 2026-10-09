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
const webStorageKey = 'workshop.session';
let webTokens: SessionTokens | null = null;
const clearListeners = new Set<() => void>();

/**
 * Browsers have no secure store. Keep the tokens in memory and mirror them to
 * sessionStorage so a page refresh keeps the person signed in; closing the tab
 * discards them (unlike localStorage, which would outlive the session).
 */
function readWebTokens(): SessionTokens | null {
  if (webTokens) return webTokens;
  try {
    const raw = globalThis.sessionStorage?.getItem(webStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionTokens>;
    if (
      typeof parsed.accessToken === 'string' &&
      typeof parsed.refreshToken === 'string'
    ) {
      webTokens = {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
      };
      return webTokens;
    }
  } catch {
    // Blocked or corrupted storage: behave as signed out.
  }
  return null;
}

function writeWebTokens(tokens: SessionTokens | null) {
  webTokens = tokens;
  try {
    if (tokens)
      globalThis.sessionStorage?.setItem(webStorageKey, JSON.stringify(tokens));
    else globalThis.sessionStorage?.removeItem(webStorageKey);
  } catch {
    // Private mode or blocked storage: the in-memory copy still works.
  }
}

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
        return readWebTokens();
      },
      async save(tokens) {
        writeWebTokens(tokens);
      },
      async clear() {
        writeWebTokens(null);
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
