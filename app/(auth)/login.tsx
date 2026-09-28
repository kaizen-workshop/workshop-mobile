import { useRouter } from 'expo-router';

import { LoginScreen } from '@/auth/presentation/login-screen';
import { useAuth } from '@/auth/session';

export default function LoginRoute() {
  const router = useRouter();
  const { login } = useAuth();

  return (
    <LoginScreen
      onFirstAccess={() => router.push('/(auth)/first-access')}
      onForgotPassword={() => router.push('/(auth)/forgot-password')}
      onSubmit={login}
    />
  );
}
