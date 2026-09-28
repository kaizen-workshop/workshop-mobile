import { createSessionController } from '@/auth/session/session-controller';

const session = {
  accessToken: 'access',
  refreshToken: 'refresh',
  mustChangePassword: false,
  requiresOnboarding: false,
};

it.each([
  [
    { ...session, mustChangePassword: true, requiresOnboarding: true },
    'REQUIRES_PASSWORD_CHANGE',
  ],
  [{ ...session, requiresOnboarding: true }, 'REQUIRES_ONBOARDING'],
  [session, 'AUTHENTICATED'],
] as const)(
  'derives the route state from a login session',
  async (result, state) => {
    const gateway = { login: jest.fn().mockResolvedValue(result) };
    const tokens = {
      read: jest.fn(),
      save: jest.fn(),
      clear: jest.fn(),
    };
    const controller = createSessionController(gateway as never, tokens);

    await controller.login({ login: 'ana', password: 'senha' });

    expect(controller.getState()).toBe(state);
    expect(tokens.save).toHaveBeenCalledWith({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  },
);

it.each([
  [true, 'REQUIRES_ONBOARDING'],
  [false, 'AUTHENTICATED'],
] as const)(
  'continues the session after password change (onboarding: %s)',
  async (requiresOnboarding, expectedState) => {
    const gateway = {
      login: jest.fn().mockResolvedValue({
        ...session,
        mustChangePassword: true,
        requiresOnboarding,
      }),
      changePassword: jest.fn().mockResolvedValue(undefined),
    };
    const tokens = {
      read: jest.fn(),
      save: jest.fn(),
      clear: jest.fn(),
    };
    const controller = createSessionController(gateway as never, tokens);
    await controller.login({ login: 'ana', password: 'temporaria' });

    await controller.changePassword({
      currentPassword: 'temporaria',
      newPassword: 'nova-senha',
    });

    expect(controller.getState()).toBe(expectedState);
    expect(gateway.changePassword).toHaveBeenCalledTimes(1);
    expect(tokens.clear).not.toHaveBeenCalled();
  },
);

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
