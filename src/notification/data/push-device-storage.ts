import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type PushDeviceStorage = Readonly<{
  read(): Promise<string | null>;
  save(deviceId: string): Promise<void>;
  clear(): Promise<void>;
}>;

type SecureStoreAdapter = Pick<
  typeof SecureStore,
  'getItemAsync' | 'setItemAsync' | 'deleteItemAsync'
>;

const deviceIdKey = 'workshop.pushDeviceId';
let webDeviceId: string | null = null;

export function createPushDeviceStorage(
  store?: SecureStoreAdapter,
  platform: typeof Platform.OS = Platform.OS,
): PushDeviceStorage {
  if (!store && platform === 'web') {
    return {
      async read() {
        return webDeviceId;
      },
      async save(deviceId) {
        webDeviceId = deviceId;
      },
      async clear() {
        webDeviceId = null;
      },
    };
  }

  const secureStore = store ?? SecureStore;
  return {
    read: () => secureStore.getItemAsync(deviceIdKey),
    save: (deviceId) => secureStore.setItemAsync(deviceIdKey, deviceId),
    clear: () => secureStore.deleteItemAsync(deviceIdKey),
  };
}
