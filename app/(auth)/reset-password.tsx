import { useRouter } from 'expo-router';
import { createAuthGateway } from '@/auth/data/auth-gateway-factory';
import { ResetPasswordScreen } from '@/auth/presentation/reset-password-screen';
import { getAppVariant } from '@/core/config';

export default function ResetPasswordRoute() {
  const router = useRouter();
  const gateway = createAuthGateway(
    process.env.APP_AUTH_MODE === 'demo' ? 'demo' : 'api',
    getAppVariant(),
  );
  return (
    <ResetPasswordScreen
      onBack={() => router.back()}
      onSubmit={async (input) => {
        await gateway.resetPassword(input);
        router.replace('/(auth)/login');
      }}
    />
  );
}
