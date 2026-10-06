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
