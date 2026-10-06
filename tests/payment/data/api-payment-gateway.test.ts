import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import { createApiPaymentGateway } from '@/payment/data';

const tokens: TokenStorage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};

const response = {
  id: 'payment-1',
  registrationId: 'registration-1',
  amount: 150,
  status: 'PENDING',
  method: 'PIX',
  externalReference: 'simulated-reference',
  createdAt: '2026-09-29T12:00:00Z',
  updatedAt: '2026-09-29T12:00:00Z',
};

it('creates an idempotent payment without sending sensitive data', async () => {
  const request = jest.fn().mockResolvedValue(response);
  const gateway = createApiPaymentGateway({ request } as HttpClient, tokens);

  await expect(
    gateway.create('registration/1', 'payment-operation'),
  ).resolves.toEqual({
    id: 'payment-1',
    registrationId: 'registration-1',
    amount: 150,
    status: 'PENDING',
    method: 'PIX',
  });
  expect(request).toHaveBeenCalledWith({
    path: '/registrations/registration%2F1/payments',
    method: 'POST',
    headers: {
      Authorization: 'Bearer access',
      'Idempotency-Key': 'payment-operation',
    },
  });
  expect(request.mock.calls[0][0]).not.toHaveProperty('body');
});

it('rejects malformed payment responses', async () => {
  const gateway = createApiPaymentGateway(
    { request: jest.fn().mockResolvedValue({ id: 'incomplete' }) },
    tokens,
  );

  await expect(
    gateway.create('registration-1', 'payment-operation'),
  ).rejects.toMatchObject({ category: 'unknown' });
});
