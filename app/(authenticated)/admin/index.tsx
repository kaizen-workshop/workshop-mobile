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
  // Scheduled posts are a nice-to-have: a failure here must not hide the dashboard.
  const loadUpcoming = useCallback(
    () =>
      gateway
        .listPosts(0, 50)
        .then((result) =>
          result.items
            .filter((post) => post.status === 'SCHEDULED' && post.scheduledAt)
            .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!))
            .slice(0, 3),
        )
        .catch(() => []),
    [gateway],
  );
  const upcoming = useAsyncData(loadUpcoming);

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
      onOpenPosts={() => router.push(adminHref.posts)}
      onOpenWorkshops={() => router.push(adminHref.workshops)}
      onRetry={dashboard.reload}
      status={dashboard.status}
      upcomingPosts={upcoming.data}
    />
  );
}
