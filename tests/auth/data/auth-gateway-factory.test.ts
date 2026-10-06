import { createAuthGateway } from '@/auth/data/auth-gateway-factory';

it('creates demo only in development or test', () => {
  expect(createAuthGateway('demo', 'development').constructor.name).toBe(
    'DemoAuthGateway',
  );
  expect(() => createAuthGateway('demo', 'production')).toThrow(
    'APP_AUTH_MODE=demo',
  );
});

it('creates the API gateway with explicit dependencies', () => {
  const gateway = createAuthGateway('api', 'staging', {
    http: { request: jest.fn() },
    tokenStorage: {
      read: jest.fn(),
      save: jest.fn(),
      clear: jest.fn(),
    },
  });

  expect(gateway.login).toEqual(expect.any(Function));
});
