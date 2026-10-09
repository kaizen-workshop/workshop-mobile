import { router } from 'expo-router';
import { useCallback } from 'react';

import {
  DashboardScreen,
  useAdminGateway,
  useAsyncData,
  adminHref,
} from '@/admin';

export default function AdminDashboardRoute() {
  const gateway = useAdminGateway();
  const load = useCallback(() => gateway.dashboard(), [gateway]);
  const dashboard = useAsyncData(load);

  return (
    <DashboardScreen
      dashboard={dashboard.data}
      error={dashboard.error}
      onCreatePost={() => router.push(adminHref.newPost)}
      onCreateWorkshop={() => router.push(adminHref.newWorkshop)}
      onOpenWorkshops={() => router.push(adminHref.workshops)}
      onRetry={dashboard.reload}
      status={dashboard.status}
    />
  );
}
