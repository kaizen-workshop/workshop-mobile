import { createSessionController } from '@/auth/session/session-controller';

const session = {
  accessToken: 'access',
  refreshToken: 'refresh',
  mustChangePassword: false,
  requiresOnboarding: false,
};

it('deduplicates concurrent refresh operations', async () => {
  const gateway = { refresh: jest.fn().mockResolvedValue(session) };
  const tokens = {
    read: jest
      .fn()
      .mockResolvedValue({ accessToken: 'old', refreshToken: 'refresh' }),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const controller = createSessionController(gateway as never, tokens);
  await controller.restore();
  await Promise.all([controller.refresh(), controller.refresh()]);
  expect(gateway.refresh).toHaveBeenCalledTimes(1);
});

it('clears tokens after a failed refresh', async () => {
  const gateway = {
    refresh: jest.fn().mockRejectedValue(new Error('offline')),
  };
  const tokens = {
    read: jest
      .fn()
      .mockResolvedValue({ accessToken: 'old', refreshToken: 'refresh' }),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const controller = createSessionController(gateway as never, tokens);
  await controller.restore();
  await expect(controller.refresh()).rejects.toThrow('offline');
  expect(controller.getState()).toBe('UNAUTHENTICATED');
  expect(tokens.clear).toHaveBeenCalled();
});
