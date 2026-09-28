import { ChangePasswordScreen } from '@/auth/presentation/change-password-screen';
import { useAuth } from '@/auth/session';

export default function ChangePasswordRoute() {
  const { changePassword } = useAuth();

  return <ChangePasswordScreen onSubmit={changePassword} />;
}
