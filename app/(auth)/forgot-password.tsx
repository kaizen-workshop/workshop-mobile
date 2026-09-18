import { useRouter } from 'expo-router';
import { createAuthGateway } from '@/auth/data/auth-gateway-factory';
import { ForgotPasswordScreen } from '@/auth/presentation/forgot-password-screen';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const gateway = createAuthGateway(
    process.env.APP_AUTH_MODE === 'demo' ? 'demo' : 'api',
    __DEV__ ? 'development' : 'production',
  );
  return (
    <ForgotPasswordScreen
      onSubmit={async (login) => {
        await gateway.requestPasswordRecovery(login);
        router.push('/(auth)/reset-password');
      }}
    />
  );
}
