import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import { createApiPreferencesGateway } from '@/preferences/data';

const tokenStorage: TokenStorage = {
  read: jest.fn().mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }),
  save: jest.fn(),
  clear: jest.fn(),
};

it('loads active themes with the stored access token', async () => {
  const request = jest.fn().mockResolvedValue([
    {
      id: 'theme-id',
      name: 'Qualidade',
      description: null,
      active: true,
    },
  ]);
  const gateway = createApiPreferencesGateway(
    { request } as HttpClient,
    tokenStorage,
  );

  await expect(gateway.listThemes()).resolves.toEqual([
    { id: 'theme-id', name: 'Qualidade' },
  ]);
  expect(request).toHaveBeenCalledWith({
    path: '/themes',
    headers: { Authorization: 'Bearer access-token' },
  });
});

it('does not request themes without a stored session', async () => {
  const request = jest.fn();
  const gateway = createApiPreferencesGateway({ request } as HttpClient, {
    ...tokenStorage,
    read: jest.fn().mockResolvedValue(null),
  });

  await expect(gateway.listThemes()).rejects.toEqual(
    expect.objectContaining({ category: 'unauthorized' }),
  );
  expect(request).not.toHaveBeenCalled();
});

it('rejects a response that does not match the API contract', async () => {
  const gateway = createApiPreferencesGateway(
    { request: jest.fn().mockResolvedValue([{ id: 'theme-id' }]) },
    tokenStorage,
  );

  await expect(gateway.listThemes()).rejects.toEqual(
    expect.objectContaining({ category: 'unknown' }),
  );
});

it('replaces the selected themes with the stored access token', async () => {
  const request = jest.fn().mockResolvedValue(undefined);
  const gateway = createApiPreferencesGateway(
    { request } as HttpClient,
    tokenStorage,
  );

  await gateway.replaceThemes(['theme-one', 'theme-two']);

  expect(request).toHaveBeenCalledWith({
    path: '/users/me/themes',
    method: 'PUT',
    headers: { Authorization: 'Bearer access-token' },
    body: { themeIds: ['theme-one', 'theme-two'] },
  });
});
