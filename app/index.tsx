import { Redirect } from 'expo-router';

import { getRouteForAuthState, useAuth } from '@/auth/session';

export default function Index() {
  const { state } = useAuth();

  return <Redirect href={getRouteForAuthState(state)} />;
}
