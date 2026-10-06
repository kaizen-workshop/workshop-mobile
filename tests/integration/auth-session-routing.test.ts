import type { AuthGateway } from '@/auth/domain/auth-gateway';
import { createSessionController, getRouteForAuthState } from '@/auth/session';

it('requires a new login after password change before onboarding', async () => {
  const gateway: AuthGateway = {
    login: jest
      .fn()
      .mockResolvedValueOnce({
        accessToken: 'access',
        refreshToken: 'refresh',
        mustChangePassword: true,
        requiresOnboarding: false,
      })
      .mockResolvedValueOnce({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        mustChangePassword: false,
        requiresOnboarding: true,
      }),
    changePassword: jest.fn().mockResolvedValue(undefined),
    refresh: jest.fn(),
    requestPasswordRecovery: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
  };
  const tokenStorage = {
    read: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const session = createSessionController(gateway, tokenStorage);

  await session.login({ login: 'ana@example.com', password: 'temporaria' });
  expect(getRouteForAuthState(session.getState())).toBe(
    '/(password-change)/change-password',
  );

  await session.changePassword({
    currentPassword: 'temporaria',
    newPassword: 'nova-senha',
  });

  expect(getRouteForAuthState(session.getState())).toBe('/(auth)/login');
  expect(tokenStorage.clear).toHaveBeenCalledTimes(1);

  await session.login({ login: 'ana@example.com', password: 'nova-senha' });
  expect(getRouteForAuthState(session.getState())).toBe(
    '/(onboarding)/preferences',
  );
  expect(tokenStorage.save).toHaveBeenCalledTimes(2);
});
