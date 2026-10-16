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
    reference: 'simulated-reference',
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

it('completes a simulated PIX payment as its owner', async () => {
  const request = jest.fn().mockResolvedValue({ ...response, status: 'PAID' });
  const gateway = createApiPaymentGateway({ request } as HttpClient, tokens);

  await expect(gateway.payWithPix('payment/1')).resolves.toMatchObject({
    id: 'payment-1',
    status: 'PAID',
  });
  expect(request).toHaveBeenCalledWith({
    path: '/payments/payment%2F1/pay',
    method: 'PATCH',
    headers: { Authorization: 'Bearer access' },
  });
});

it('rejects a blank payment id before calling the API', async () => {
  const request = jest.fn();
  const gateway = createApiPaymentGateway({ request } as HttpClient, tokens);

  await expect(gateway.payWithPix('  ')).rejects.toBeDefined();
  expect(request).not.toHaveBeenCalled();
});
