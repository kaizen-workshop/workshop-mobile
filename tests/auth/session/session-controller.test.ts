import { createSessionController } from '@/auth/session/session-controller';
import { AppError } from '@/core/errors';

const session = {
  accessToken: 'access',
  refreshToken: 'refresh',
  mustChangePassword: false,
  requiresOnboarding: false,
};

function jwt(payload: object) {
  const encode = (value: object) =>
    globalThis
      .btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  return `${encode({ alg: 'none' })}.${encode(payload)}.signature`;
}

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

it.each([true, false])(
  'clears the revoked session after password change (onboarding: %s)',
  async (requiresOnboarding) => {
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

    expect(controller.getState()).toBe('UNAUTHENTICATED');
    expect(gateway.changePassword).toHaveBeenCalledTimes(1);
    expect(tokens.clear).toHaveBeenCalledTimes(1);
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
  await Promise.all([controller.refresh(), controller.refresh()]);
  expect(gateway.refresh).toHaveBeenCalledTimes(1);
});

it.each([
  ['REQUIRES_PASSWORD_CHANGE', true, false],
  ['REQUIRES_ONBOARDING', false, true],
  ['AUTHENTICATED', false, false],
] as const)(
  'validates and restores the persisted session as %s',
  async (expectedState, mustChangePassword, requiresOnboarding) => {
    const gateway = {
      refresh: jest.fn().mockResolvedValue({
        ...session,
        accessToken: 'rotated-access',
        refreshToken: 'rotated-refresh',
        mustChangePassword,
        requiresOnboarding,
      }),
    };
    const tokens = {
      read: jest.fn().mockResolvedValue({
        accessToken: 'old-access',
        refreshToken: 'old-refresh',
      }),
      save: jest.fn(),
      clear: jest.fn(),
    };
    const controller = createSessionController(gateway as never, tokens);

    await controller.restore();

    expect(gateway.refresh).toHaveBeenCalledWith('old-refresh');
    expect(tokens.save).toHaveBeenCalledWith({
      accessToken: 'rotated-access',
      refreshToken: 'rotated-refresh',
    });
    expect(controller.getState()).toBe(expectedState);
  },
);

it('does not trust persisted tokens when session validation fails', async () => {
  const gateway = {
    refresh: jest.fn().mockRejectedValue(new Error('revoked')),
  };
  const tokens = {
    read: jest.fn().mockResolvedValue({
      accessToken: 'stale-access',
      refreshToken: 'revoked-refresh',
    }),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const controller = createSessionController(gateway as never, tokens);

  await expect(controller.restore()).rejects.toThrow('revoked');

  expect(controller.getState()).toBe('UNAUTHENTICATED');
  expect(tokens.clear).toHaveBeenCalledTimes(1);
});

it('keeps an unexpired local session readable during a connectivity outage', async () => {
  const accessToken = jwt({
    sub: 'user-1',
    exp: Math.floor(Date.now() / 1_000) + 600,
    mustChangePassword: false,
    requiresOnboarding: false,
  });
  const gateway = {
    refresh: jest.fn().mockRejectedValue(new AppError({ category: 'network' })),
  };
  const tokens = {
    read: jest.fn().mockResolvedValue({ accessToken, refreshToken: 'refresh' }),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const controller = createSessionController(gateway as never, tokens);

  await controller.restore();

  expect(controller.getState()).toBe('AUTHENTICATED');
  expect(tokens.clear).not.toHaveBeenCalled();
});

it('preserves required onboarding during an offline restore', async () => {
  const accessToken = jwt({
    sub: 'user-1',
    exp: Math.floor(Date.now() / 1_000) + 600,
    mustChangePassword: false,
    requiresOnboarding: true,
  });
  const gateway = {
    refresh: jest.fn().mockRejectedValue(new AppError({ category: 'network' })),
  };
  const tokens = {
    read: jest.fn().mockResolvedValue({ accessToken, refreshToken: 'refresh' }),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const controller = createSessionController(gateway as never, tokens);

  await controller.restore();

  expect(controller.getState()).toBe('REQUIRES_ONBOARDING');
  expect(tokens.clear).not.toHaveBeenCalled();
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
  await expect(controller.refresh()).rejects.toThrow('offline');
  expect(controller.getState()).toBe('UNAUTHENTICATED');
  expect(tokens.clear).toHaveBeenCalled();
});

it('finishes onboarding only from the onboarding state', async () => {
  const gateway = {
    login: jest.fn().mockResolvedValue({
      ...session,
      requiresOnboarding: true,
    }),
  };
  const tokens = {
    read: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const controller = createSessionController(gateway as never, tokens);
  await controller.login({ login: 'ana', password: 'senha' });

  controller.completeOnboarding();

  expect(controller.getState()).toBe('AUTHENTICATED');
});

it('uses the latest rotated refresh token when logging out', async () => {
  const gateway = {
    logout: jest.fn().mockResolvedValue(undefined),
  };
  const tokens = {
    read: jest.fn().mockResolvedValue({
      accessToken: 'rotated-access',
      refreshToken: 'rotated-refresh',
    }),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const controller = createSessionController(gateway as never, tokens);

  await controller.logout();

  expect(gateway.logout).toHaveBeenCalledWith('rotated-refresh');
  expect(tokens.clear).toHaveBeenCalledTimes(1);
});

it('unregisters push before revoking and clearing the session', async () => {
  const order: string[] = [];
  const gateway = {
    logout: jest.fn().mockImplementation(async () => {
      order.push('logout');
    }),
  };
  const tokens = {
    read: jest.fn().mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    }),
    save: jest.fn(),
    clear: jest.fn().mockImplementation(async () => {
      order.push('clear');
    }),
  };
  const beforeLogout = jest.fn().mockImplementation(async () => {
    order.push('push');
  });
  const controller = createSessionController(
    gateway as never,
    tokens,
    beforeLogout,
  );

  await controller.logout();

  expect(order).toEqual(['push', 'logout', 'clear']);
});
