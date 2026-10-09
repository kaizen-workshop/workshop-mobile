import { router } from 'expo-router';
import { useCallback } from 'react';
import { useRole } from '@/auth/session';

import {
  DashboardScreen,
  useAdminGateway,
  useAsyncData,
  adminHref,
} from '@/admin';

export default function AdminDashboardRoute() {
  const role = useRole();
  const gateway = useAdminGateway();
  const load = useCallback(() => gateway.dashboard(), [gateway]);
  const dashboard = useAsyncData(load);

  return (
    <DashboardScreen
      dashboard={dashboard.data}
      error={dashboard.error}
      onCreateAnnouncement={() => router.push(adminHref.newAnnouncement)}
      onCreatePost={() => router.push(adminHref.newPost)}
      onCreateWorkshop={() => router.push(adminHref.newWorkshop)}
      onManageTaxonomies={
        role === 'ADMIN' ? () => router.push(adminHref.taxonomies) : undefined
      }
      onOpenWorkshops={() => router.push(adminHref.workshops)}
      onRetry={dashboard.reload}
      status={dashboard.status}
    />
  );
}
