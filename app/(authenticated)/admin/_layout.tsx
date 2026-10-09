import { Redirect, Stack } from 'expo-router';

import { canManage, useRole } from '@/auth/session';
import { LoadingState } from '@/shared/presentation';

/** Administrative area: only ARWEG and ADMIN accounts get past this layout. */
export default function AdminLayout() {
  const role = useRole();
  if (role === null) return <LoadingState message="Verificando acesso..." />;
  if (!canManage(role)) return <Redirect href="/(authenticated)/(tabs)/feed" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
