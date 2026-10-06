jest.mock('expo-constants', () => ({
  expoConfig: { extra: { eas: { projectId: 'project-id' } } },
}));
jest.mock('expo-device', () => ({ isDevice: true }));
jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getExpoPushTokenAsync: jest
    .fn()
    .mockResolvedValue({ data: 'ExponentPushToken[test]' }),
}));
import { unregisterPushDevice } from '@/notification/data/push-device-lifecycle';
import { registerPushDevice } from '@/notification/data/push-registration';

it('persists the API device id after push registration', async () => {
  const gateway = {
    registerDevice: jest.fn().mockResolvedValue('device-1'),
  };
  const storage = {
    read: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
  };

  await expect(registerPushDevice(gateway as never, storage)).resolves.toEqual({
    status: 'registered',
    deviceId: 'device-1',
  });

  expect(storage.save).toHaveBeenCalledWith('device-1');
});

it('unregisters the persisted device before clearing it', async () => {
  const gateway = {
    unregisterDevice: jest.fn().mockResolvedValue(undefined),
  };
  const storage = {
    read: jest.fn().mockResolvedValue('device-1'),
    save: jest.fn(),
    clear: jest.fn(),
  };

  await unregisterPushDevice(gateway as never, storage);

  expect(gateway.unregisterDevice).toHaveBeenCalledWith('device-1');
  expect(storage.clear).toHaveBeenCalledTimes(1);
});
