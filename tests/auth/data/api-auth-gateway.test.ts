import { createApiAuthGateway } from '@/auth/data/api-auth-gateway';

const tokenResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  mustChangePassword: false,
};

function setup(responses: unknown[] = [tokenResponse, { themes: [] }]) {
  const http = {
    request: jest
      .fn()
      .mockImplementation(() => Promise.resolve(responses.shift())),
  };
  const tokenStorage = {
    read: jest.fn().mockResolvedValue({
      accessToken: 'stored-access',
      refreshToken: 'stored-refresh',
    }),
    save: jest.fn(),
    clear: jest.fn(),
  };
  return {
    gateway: createApiAuthGateway(http, tokenStorage),
    http,
  };
}

it('logs in and derives onboarding from the authenticated profile', async () => {
  const { gateway, http } = setup();

  await expect(
    gateway.login({ login: 'ana', password: 'secret' }),
  ).resolves.toEqual({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    mustChangePassword: false,
    requiresOnboarding: true,
  });
  expect(http.request).toHaveBeenNthCalledWith(1, {
    path: '/auth/login',
    method: 'POST',
    body: { login: 'ana', password: 'secret' },
  });
  expect(http.request).toHaveBeenNthCalledWith(2, {
    path: '/users/me',
    headers: { Authorization: 'Bearer access-token' },
  });
});

it('does not query the profile before a required password change', async () => {
  const { gateway, http } = setup([
    { ...tokenResponse, mustChangePassword: true },
  ]);

  await expect(
    gateway.login({ login: 'ana', password: 'temporary' }),
  ).resolves.toMatchObject({
    mustChangePassword: true,
    requiresOnboarding: false,
  });
  expect(http.request).toHaveBeenCalledTimes(1);
});

it('uses the API request contracts for session operations', async () => {
  const { gateway, http } = setup([undefined, undefined, undefined, undefined]);

  await gateway.changePassword({
    currentPassword: 'old',
    newPassword: 'new',
  });
  await gateway.requestPasswordRecovery('ana@example.com');
  await gateway.resetPassword({ code: 'token', password: 'new-password' });
  await gateway.logout('refresh-token');

  expect(http.request.mock.calls).toEqual([
    [
      {
        path: '/auth/change-password',
        method: 'POST',
        headers: { Authorization: 'Bearer stored-access' },
        body: { currentPassword: 'old', newPassword: 'new' },
      },
    ],
    [
      {
        path: '/auth/forgot-password',
        method: 'POST',
        body: { email: 'ana@example.com' },
      },
    ],
    [
      {
        path: '/auth/reset-password',
        method: 'POST',
        body: { token: 'token', newPassword: 'new-password' },
      },
    ],
    [
      {
        path: '/auth/logout',
        method: 'POST',
        body: { refreshToken: 'refresh-token' },
      },
    ],
  ]);
});

it('rejects malformed token responses', async () => {
  const { gateway } = setup([{ accessToken: 'only-one-token' }]);

  await expect(
    gateway.login({ login: 'ana', password: 'secret' }),
  ).rejects.toMatchObject({ category: 'unknown' });
});
