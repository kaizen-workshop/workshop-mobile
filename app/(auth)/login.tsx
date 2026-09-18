import { useRouter } from 'expo-router';
import { createAuthGateway } from '@/auth/data/auth-gateway-factory';
import { LoginScreen } from '@/auth/presentation/login-screen';

export default function LoginRoute() {
  const router = useRouter();
  const gateway = createAuthGateway(
    process.env.APP_AUTH_MODE === 'demo' ? 'demo' : 'api',
    __DEV__ ? 'development' : 'production',
  );
  return (
    <LoginScreen
      onSubmit={async (input) => {
        await gateway.login(input);
        router.replace('/');
      }}
    />
  );
}
