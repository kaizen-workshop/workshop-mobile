import type { AuthGateway } from '../domain/auth-gateway';
import { getEnvironment } from '@/core/config';
import { createHttpClient, type HttpClient } from '@/core/http';
import { createTokenStorage, type TokenStorage } from '@/core/secure-storage';
import { createApiAuthGateway } from './api-auth-gateway';
import { DemoAuthGateway } from './demo-auth-gateway';
export function createAuthGateway(
  mode: 'demo' | 'api',
  variant: string,
  dependencies?: Readonly<{
    http: HttpClient;
    tokenStorage: TokenStorage;
  }>,
): AuthGateway {
  if (mode === 'demo') {
    if (!['development', 'test'].includes(variant))
      throw new Error(
        'APP_AUTH_MODE=demo é permitido apenas em development/test.',
      );
    return new DemoAuthGateway();
  }
  return createApiAuthGateway(
    dependencies?.http ?? createHttpClient(getEnvironment()),
    dependencies?.tokenStorage ?? createTokenStorage(),
  );
}
