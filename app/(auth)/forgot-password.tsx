import { useRouter } from 'expo-router';
import { createAuthGateway } from '@/auth/data/auth-gateway-factory';
import { ForgotPasswordScreen } from '@/auth/presentation/forgot-password-screen';
import { getAppVariant } from '@/core/config';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const gateway = createAuthGateway(
    process.env.APP_AUTH_MODE === 'demo' ? 'demo' : 'api',
    getAppVariant(),
  );
  return (
    <ForgotPasswordScreen
      onBack={() => router.back()}
      onSubmit={async (login) => {
        await gateway.requestPasswordRecovery(login);
        router.push('/(auth)/reset-password');
      }}
    />
  );
}
