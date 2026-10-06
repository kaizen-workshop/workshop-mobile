import type { NotificationGateway } from './api-notification-gateway';
import {
  createPushDeviceStorage,
  type PushDeviceStorage,
} from './push-device-storage';

export async function unregisterPushDevice(
  gateway: NotificationGateway,
  storage: PushDeviceStorage = createPushDeviceStorage(),
) {
  const deviceId = await storage.read();
  if (!deviceId) return;
  await gateway.unregisterDevice(deviceId);
  await storage.clear();
}
