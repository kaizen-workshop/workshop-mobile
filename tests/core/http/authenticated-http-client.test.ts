import { AppError } from '@/core/errors';
import { createAuthenticatedHttpClient } from '@/core/http';

const config = {
  variant: 'development' as const,
  apiUrl: 'https://api.example.test/api/v1',
};

it('deduplicates concurrent refreshes and retries with the rotated access token', async () => {
  let tokens = { accessToken: 'expired', refreshToken: 'refresh-1' };
  const storage = {
    read: jest.fn(async () => tokens),
    save: jest.fn(async (value: typeof tokens) => {
      tokens = value;
    }),
    clear: jest.fn(),
  };
  const request = jest.fn(
    async (input: { path: string; headers?: HeadersInit }) => {
      if (input.path === '/auth/refresh') {
        return {
          accessToken: 'access-2',
          refreshToken: 'refresh-2',
          tokenType: 'Bearer',
          mustChangePassword: false,
        };
      }
      if (
        new Headers(input.headers).get('Authorization') === 'Bearer expired'
      ) {
        throw new AppError({ category: 'unauthorized', status: 401 });
      }
      return { ok: true };
    },
  );
  const client = createAuthenticatedHttpClient(config, storage, {
    request,
  } as never);

  await expect(
    Promise.all([
      client.request({
        path: '/workshops',
        headers: { Authorization: 'Bearer expired' },
      }),
      client.request({
        path: '/notifications',
        headers: { Authorization: 'Bearer expired' },
      }),
    ]),
  ).resolves.toEqual([{ ok: true }, { ok: true }]);

  expect(
    request.mock.calls.filter(([input]) => input.path === '/auth/refresh'),
  ).toHaveLength(1);
  expect(storage.save).toHaveBeenCalledWith({
    accessToken: 'access-2',
    refreshToken: 'refresh-2',
  });
  expect(
    request.mock.calls
      .filter(([input]) => input.path !== '/auth/refresh')
      .slice(-2)
      .map(([input]) => new Headers(input.headers).get('Authorization')),
  ).toEqual(['Bearer access-2', 'Bearer access-2']);
});

it('clears the session when the refresh token is rejected', async () => {
  const storage = {
    read: jest.fn().mockResolvedValue({
      accessToken: 'expired',
      refreshToken: 'invalid-refresh',
    }),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const request = jest.fn(async (input: { path: string }) => {
    throw new AppError({
      category: 'unauthorized',
      status: 401,
      technicalMessage: input.path,
    });
  });
  const client = createAuthenticatedHttpClient(config, storage, {
    request,
  } as never);

  await expect(
    client.request({
      path: '/workshops',
      headers: { Authorization: 'Bearer expired' },
    }),
  ).rejects.toMatchObject({ category: 'unauthorized' });
  expect(storage.clear).toHaveBeenCalledTimes(1);
});
