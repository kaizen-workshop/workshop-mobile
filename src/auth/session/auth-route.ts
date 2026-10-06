import type { AuthState } from './session-controller';

export type AuthRoute =
  | '/(auth)/login'
  | '/(password-change)/change-password'
  | '/(onboarding)/preferences'
  | '/(authenticated)/(tabs)/feed';

export function getRouteForAuthState(state: AuthState): AuthRoute {
  switch (state) {
    case 'REQUIRES_PASSWORD_CHANGE':
      return '/(password-change)/change-password';
    case 'REQUIRES_ONBOARDING':
      return '/(onboarding)/preferences';
    case 'AUTHENTICATED':
      return '/(authenticated)/(tabs)/feed';
    default:
      return '/(auth)/login';
  }
}
