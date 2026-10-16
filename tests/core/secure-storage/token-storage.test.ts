import { createTokenStorage } from '@/core/secure-storage/token-storage';

const adapter = {
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

it('uses only secure token keys', async () => {
  await createTokenStorage(adapter).save({
    accessToken: 'access',
    refreshToken: 'refresh',
  });
  expect(adapter.setItemAsync).toHaveBeenNthCalledWith(
    1,
    'workshop.accessToken',
    'access',
  );
  expect(adapter.setItemAsync).toHaveBeenNthCalledWith(
    2,
    'workshop.refreshToken',
    'refresh',
  );
});

it('returns null when a token is missing and clears both token keys', async () => {
  adapter.getItemAsync
    .mockResolvedValueOnce('access')
    .mockResolvedValueOnce(null);
  const storage = createTokenStorage(adapter);
  await expect(storage.read()).resolves.toBeNull();
  await storage.clear();
  expect(adapter.deleteItemAsync).toHaveBeenCalledWith('workshop.accessToken');
  expect(adapter.deleteItemAsync).toHaveBeenCalledWith('workshop.refreshToken');
});

it('shares tokens only in memory between web gateways', async () => {
  const authStorage = createTokenStorage(undefined, 'web');
  const profileStorage = createTokenStorage(undefined, 'web');
  await authStorage.clear();

  await authStorage.save({
    accessToken: 'web-access',
    refreshToken: 'web-refresh',
  });

  await expect(profileStorage.read()).resolves.toEqual({
    accessToken: 'web-access',
    refreshToken: 'web-refresh',
  });
  await profileStorage.clear();
  await expect(authStorage.read()).resolves.toBeNull();
});

describe('web session persistence', () => {
  const store = new Map<string, string>();
  const fake = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };

  beforeEach(() => {
    store.clear();
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: fake,
    });
  });
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'sessionStorage');
  });

  it('mirrors saved tokens to sessionStorage so a refresh can find them', async () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    await createTokenStorage(undefined, 'web').save(tokens);
    expect(JSON.parse(store.get('workshop.session') as string)).toEqual(tokens);
  });

  it('restores tokens that only exist in sessionStorage', async () => {
    jest.resetModules();
    store.set(
      'workshop.session',
      JSON.stringify({ accessToken: 'from-tab', refreshToken: 'refresh-tab' }),
    );
    const { createTokenStorage: fresh } = require('@/core/secure-storage');
    await expect(fresh(undefined, 'web').read()).resolves.toEqual({
      accessToken: 'from-tab',
      refreshToken: 'refresh-tab',
    });
  });

  it('forgets the session on clear and ignores corrupted data', async () => {
    jest.resetModules();
    const { createTokenStorage: fresh } = require('@/core/secure-storage');
    store.set('workshop.session', '{not json');
    await expect(fresh(undefined, 'web').read()).resolves.toBeNull();

    const storage = fresh(undefined, 'web');
    await storage.save({ accessToken: 'a', refreshToken: 'r' });
    await storage.clear();
    expect(store.has('workshop.session')).toBe(false);
  });
});
