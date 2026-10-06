import { router, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { resolveNotificationData } from '@/notification/presentation';
import { selectGroup, selectPost, selectWorkshop } from '@/navigation';

export default function AuthenticatedLayout() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const raw = response.notification.request.content.data ?? {};
        const data = Object.fromEntries(
          Object.entries(raw).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
          ),
        );
        const target = resolveNotificationData(data);
        if (target?.pathname === '/(authenticated)/workshops/[id]') {
          selectWorkshop({ id: target.params.id });
          router.push('/(authenticated)/workshop');
        } else if (
          target?.pathname === '/(authenticated)/posts/[id]/comments'
        ) {
          selectPost({ id: target.params.id });
          router.push('/(authenticated)/comments');
        } else if (target?.pathname === '/(authenticated)/groups/[id]') {
          selectGroup({ id: target.params.id });
          router.push('/(authenticated)/group');
        } else if (target) router.push(target);
      },
    );
    return () => subscription.remove();
  }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}
