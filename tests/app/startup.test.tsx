import { getRouteForAuthState } from '@/auth/session';

it.each([
  ['UNAUTHENTICATED', '/(auth)/login'],
  ['REQUIRES_PASSWORD_CHANGE', '/(password-change)/change-password'],
  ['REQUIRES_ONBOARDING', '/(onboarding)/preferences'],
  ['AUTHENTICATED', '/(authenticated)/(tabs)/feed'],
] as const)('routes %s sessions to %s', (state, route) => {
  expect(getRouteForAuthState(state)).toBe(route);
});
