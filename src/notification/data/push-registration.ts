import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationGateway } from './api-notification-gateway';

export type PushRegistrationResult =
  | { status: 'registered'; deviceId: string }
  | { status: 'unavailable' | 'denied' | 'missing_project_id' };

export async function registerPushDevice(
  gateway: NotificationGateway,
): Promise<PushRegistrationResult> {
  if (!Device.isDevice || !['android', 'ios'].includes(Platform.OS))
    return { status: 'unavailable' };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificações',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission =
    current.status === 'granted'
      ? current
      : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return { status: 'denied' };

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof projectId !== 'string' || !projectId)
    return { status: 'missing_project_id' };

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const deviceId = await gateway.registerDevice(
    token,
    Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
  );
  return { status: 'registered', deviceId };
}
