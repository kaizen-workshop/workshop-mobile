import type { NotificationItem } from '@/notification/domain';

export type NotificationRoute =
  | { pathname: '/(authenticated)/workshops/[id]'; params: { id: string } }
  | { pathname: '/(authenticated)/posts/[id]/comments'; params: { id: string } }
  | { pathname: '/(authenticated)/groups/[id]'; params: { id: string } };

export function resolveNotificationRoute(
  notification: NotificationItem,
): NotificationRoute | undefined {
  return resolveNotificationData(notification.data);
}

export function resolveNotificationData(
  data: Readonly<Record<string, string>>,
): NotificationRoute | undefined {
  if (data.groupId)
    return {
      pathname: '/(authenticated)/groups/[id]',
      params: { id: data.groupId },
    };
  if (data.postId)
    return {
      pathname: '/(authenticated)/posts/[id]/comments',
      params: { id: data.postId },
    };
  if (data.workshopId)
    return {
      pathname: '/(authenticated)/workshops/[id]',
      params: { id: data.workshopId },
    };
  return undefined;
}
