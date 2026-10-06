import { useRouter } from 'expo-router';

import { createAuthGateway } from '@/auth/data/auth-gateway-factory';
import { FirstAccessScreen } from '@/auth/presentation/first-access-screen';
import { getAppVariant } from '@/core/config';

export default function FirstAccessRoute() {
  const router = useRouter();
  const gateway = createAuthGateway(
    process.env.APP_AUTH_MODE === 'demo' ? 'demo' : 'api',
    getAppVariant(),
  );
  return (
    <FirstAccessScreen
      onBack={() => router.back()}
      onRequestCode={(login) => gateway.requestPasswordRecovery(login)}
      onSubmit={async (input) => {
        await gateway.resetPassword(input);
        router.replace('/(auth)/login');
      }}
    />
  );
}
