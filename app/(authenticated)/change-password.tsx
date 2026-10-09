import { router } from 'expo-router';

import { ChangePasswordScreen } from '@/auth/presentation/change-password-screen';
import { useAuth } from '@/auth/session';

export default function AuthenticatedChangePasswordRoute() {
  const { changePassword } = useAuth();

  // The session ends after a successful change, so the person signs in again.
  return (
    <ChangePasswordScreen
      onCancel={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(authenticated)/settings');
      }}
      onSubmit={changePassword}
    />
  );
}
