import { useRouter } from 'expo-router';
import { FirstAccessScreen } from '@/auth/presentation/first-access-screen';

export default function FirstAccessRoute() {
  const router = useRouter();
  return (
    <FirstAccessScreen
      onSubmit={async (code) => {
        if (code !== '123456') throw new Error('invalid code');
        router.replace('/');
      }}
    />
  );
}
