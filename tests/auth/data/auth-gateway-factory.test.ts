import { createAuthGateway } from '@/auth/data/auth-gateway-factory';

it('creates demo only in development or test', () => {
  expect(createAuthGateway('demo', 'development').constructor.name).toBe(
    'DemoAuthGateway',
  );
  expect(() => createAuthGateway('demo', 'production')).toThrow(
    'APP_AUTH_MODE=demo',
  );
});
