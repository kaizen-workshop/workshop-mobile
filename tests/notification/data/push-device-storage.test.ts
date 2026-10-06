import { createPushDeviceStorage } from '@/notification/data/push-device-storage';

it('persists and clears the push device id in secure storage', async () => {
  const store = {
    getItemAsync: jest.fn().mockResolvedValue('device-1'),
    setItemAsync: jest.fn().mockResolvedValue(undefined),
    deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  };
  const storage = createPushDeviceStorage(store, 'ios');

  await expect(storage.read()).resolves.toBe('device-1');
  await storage.save('device-2');
  await storage.clear();

  expect(store.setItemAsync).toHaveBeenCalledWith(
    'workshop.pushDeviceId',
    'device-2',
  );
  expect(store.deleteItemAsync).toHaveBeenCalledWith('workshop.pushDeviceId');
});
