import * as SecureStore from 'expo-secure-store';

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
}>;
const accessTokenKey = 'workshop.accessToken';
const refreshTokenKey = 'workshop.refreshToken';

export function createTokenStorage(
  store: SecureStoreAdapter = SecureStore,
): TokenStorage {
  return {
    async read() {
      const [accessToken, refreshToken] = await Promise.all([
        store.getItemAsync(accessTokenKey),
        store.getItemAsync(refreshTokenKey),
      ]);
      return accessToken && refreshToken ? { accessToken, refreshToken } : null;
    },
    async save(tokens) {
      await store.setItemAsync(accessTokenKey, tokens.accessToken);
      await store.setItemAsync(refreshTokenKey, tokens.refreshToken);
    },
    async clear() {
      await Promise.all([
        store.deleteItemAsync(accessTokenKey),
        store.deleteItemAsync(refreshTokenKey),
      ]);
    },
  };
}
