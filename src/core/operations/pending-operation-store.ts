import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

type Kind = 'registration' | 'cancellation' | 'payment';
const keyFor = (userId: string, kind: Kind, resourceId: string) =>
  `workshop.pending-operation.${encodeURIComponent(userId)}.${kind}.${encodeURIComponent(resourceId)}`;

export function createPendingOperationStore(
  storage: Pick<
    typeof AsyncStorage,
    'getItem' | 'setItem' | 'removeItem'
  > = AsyncStorage,
) {
  return {
    async getOrCreate(userId: string, kind: Kind, resourceId: string) {
      const key = keyFor(userId.trim(), kind, resourceId.trim());
      const existing = await storage.getItem(key);
      if (existing) return existing;
      const operationId = Crypto.randomUUID();
      await storage.setItem(key, operationId);
      return operationId;
    },
    complete(userId: string, kind: Kind, resourceId: string) {
      return storage.removeItem(keyFor(userId.trim(), kind, resourceId.trim()));
    },
  };
}
