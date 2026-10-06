import { AppError } from '@/core/errors';

import type { AuthGateway, AuthSession } from '../domain/auth-gateway';

const demoSession: AuthSession = {
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
  mustChangePassword: false,
  requiresOnboarding: false,
};

export class DemoAuthGateway implements AuthGateway {
  async login(input: {
    login: string;
    password: string;
  }): Promise<AuthSession> {
    if (!input.login.trim() || !input.password) {
      throw new AppError({
        category: 'bad_request',
        code: 'AUTH_INVALID_CREDENTIALS',
      });
    }
    return demoSession;
  }

  async refresh(): Promise<AuthSession> {
    return demoSession;
  }
  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    if (!input.currentPassword || !input.newPassword)
      throw new AppError({ category: 'bad_request' });
  }
  async requestPasswordRecovery(login: string): Promise<void> {
    if (!login.trim()) throw new AppError({ category: 'bad_request' });
  }
  async resetPassword(input: {
    code: string;
    password: string;
  }): Promise<void> {
    if (input.code !== '123456')
      throw new AppError({
        category: 'bad_request',
        code: 'AUTH_INVALID_RECOVERY_CODE',
      });
    if (!input.password) throw new AppError({ category: 'bad_request' });
  }
  async logout(): Promise<void> {}
}
