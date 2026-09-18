import type { AuthGateway } from '../domain/auth-gateway';
import { DemoAuthGateway } from './demo-auth-gateway';
import { unavailableAuthGateway } from './unavailable-auth-gateway';
export function createAuthGateway(
  mode: 'demo' | 'api',
  variant: string,
): AuthGateway {
  if (mode === 'demo') {
    if (!['development', 'test'].includes(variant))
      throw new Error(
        'APP_AUTH_MODE=demo é permitido apenas em development/test.',
      );
    return new DemoAuthGateway();
  }
  return unavailableAuthGateway;
}
