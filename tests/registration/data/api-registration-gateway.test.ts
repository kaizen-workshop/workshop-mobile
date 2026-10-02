import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import { createApiRegistrationGateway } from '@/registration/data';

const tokens: TokenStorage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};

const response = {
  id: 'registration-1',
  workshopId: 'workshop-1',
  status: 'WAITING_LIST',
  paymentStatus: 'EXEMPT',
  waitingListPosition: 3,
  userId: 'user-1',
  registeredAt: '2026-09-29T12:00:00Z',
};

it('registers once through the authenticated workshop endpoint', async () => {
  const request = jest.fn().mockResolvedValue(response);
  const gateway = createApiRegistrationGateway(
    { request } as HttpClient,
    tokens,
  );

  await expect(
    gateway.register('workshop/1', 'operation-key'),
  ).resolves.toEqual({
    id: 'registration-1',
    workshopId: 'workshop-1',
    status: 'WAITING_LIST',
    paymentStatus: 'EXEMPT',
    waitingListPosition: 3,
  });
  expect(request).toHaveBeenCalledWith({
    path: '/workshops/workshop%2F1/registrations',
    method: 'POST',
    headers: {
      Authorization: 'Bearer access',
      'Idempotency-Key': 'operation-key',
    },
  });
});

it('rejects malformed registration responses', async () => {
  const gateway = createApiRegistrationGateway(
    { request: jest.fn().mockResolvedValue({ id: 'incomplete' }) },
    tokens,
  );

  await expect(
    gateway.register('workshop-1', 'operation-key'),
  ).rejects.toMatchObject({
    category: 'unknown',
  });
});

it('preserves API conflicts for an existing or closed registration', async () => {
  const conflict = new AppError({ category: 'conflict', status: 409 });
  const gateway = createApiRegistrationGateway(
    { request: jest.fn().mockRejectedValue(conflict) },
    tokens,
  );

  await expect(gateway.register('workshop-1', 'operation-key')).rejects.toBe(
    conflict,
  );
});

it('reuses the caller-provided key when the same operation is retried', async () => {
  const request = jest.fn().mockResolvedValue(response);
  const gateway = createApiRegistrationGateway(
    { request } as HttpClient,
    tokens,
  );

  await gateway.register('workshop-1', 'stable-key');
  await gateway.register('workshop-1', 'stable-key');

  expect(request).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      headers: expect.objectContaining({ 'Idempotency-Key': 'stable-key' }),
    }),
  );
  expect(request).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      headers: expect.objectContaining({ 'Idempotency-Key': 'stable-key' }),
    }),
  );
});

it('loads the current registration and treats not found as no registration', async () => {
  const request = jest
    .fn()
    .mockResolvedValueOnce(response)
    .mockRejectedValueOnce(
      new AppError({ category: 'not_found', status: 404 }),
    );
  const gateway = createApiRegistrationGateway(
    { request } as HttpClient,
    tokens,
  );

  await expect(gateway.loadCurrent('workshop-1')).resolves.toMatchObject({
    id: 'registration-1',
    status: 'WAITING_LIST',
    waitingListPosition: 3,
  });
  await expect(gateway.loadCurrent('workshop-2')).resolves.toBeNull();
  expect(request).toHaveBeenNthCalledWith(1, {
    path: '/workshops/workshop-1/registrations/me',
    headers: { Authorization: 'Bearer access' },
  });
});

it('cancels the owners registration through the API', async () => {
  const cancelled = {
    ...response,
    status: 'CANCELLED',
    paymentStatus: 'PAID',
    waitingListPosition: null,
  };
  const request = jest.fn().mockResolvedValue(cancelled);
  const gateway = createApiRegistrationGateway(
    { request } as HttpClient,
    tokens,
  );

  await expect(gateway.cancel('registration/1')).resolves.toMatchObject({
    status: 'CANCELLED',
    paymentStatus: 'PAID',
  });
  expect(request).toHaveBeenCalledWith({
    path: '/registrations/registration%2F1/cancel',
    method: 'PATCH',
    headers: { Authorization: 'Bearer access' },
  });
});
