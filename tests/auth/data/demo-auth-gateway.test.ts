import { DemoAuthGateway } from '@/auth/data/demo-auth-gateway';

describe('DemoAuthGateway', () => {
  it('authenticates non-empty credentials', async () => {
    await expect(
      new DemoAuthGateway().login({ login: 'ana', password: 'senha' }),
    ).resolves.toMatchObject({ mustChangePassword: false });
  });

  it('rejects a recovery code other than 123456', async () => {
    await expect(
      new DemoAuthGateway().resetPassword({ code: '000000', password: 'nova' }),
    ).rejects.toMatchObject({ code: 'AUTH_INVALID_RECOVERY_CODE' });
  });
});
