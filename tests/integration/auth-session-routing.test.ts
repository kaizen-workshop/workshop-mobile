import type { AuthGateway } from '@/auth/domain/auth-gateway';
import { createSessionController, getRouteForAuthState } from '@/auth/session';

it('routes login through password change and onboarding without replacing the session', async () => {
  const gateway: AuthGateway = {
    login: jest.fn().mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      mustChangePassword: true,
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

  expect(getRouteForAuthState(session.getState())).toBe(
    '/(onboarding)/preferences',
  );
  expect(tokenStorage.save).toHaveBeenCalledTimes(1);
  expect(tokenStorage.clear).not.toHaveBeenCalled();
});
