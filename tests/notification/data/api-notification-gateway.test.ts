import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import {
  createApiNotificationGateway,
  mergeNotifications,
} from '@/notification/data';

const tokens: TokenStorage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};

const item = {
  id: 'notification-1',
  type: 'REGISTRATION_CREATED',
  title: 'Inscrição criada',
  message: 'Sua inscrição foi recebida.',
  read: false,
  data: { workshopId: 'workshop-1' },
  createdAt: '2026-09-29T12:00:00Z',
};

it('loads the requested notification page in API order', async () => {
  const request = jest.fn().mockResolvedValue({
    content: [item],
    number: 2,
    last: false,
  });
  const gateway = createApiNotificationGateway(
    { request } as HttpClient,
    tokens,
  );

  await expect(gateway.loadPage(2, 10)).resolves.toEqual({
    items: [item],
    page: 2,
    hasMore: true,
  });
  expect(request).toHaveBeenCalledWith({
    path: '/notifications?page=2&size=10',
    headers: { Authorization: 'Bearer access' },
  });
});

it('deduplicates overlapping pages while preserving order', () => {
  const second = { ...item, id: 'notification-2' };

  expect(mergeNotifications([item], [item, second])).toEqual([item, second]);
});

it('rejects malformed notification pages', async () => {
  const gateway = createApiNotificationGateway(
    { request: jest.fn().mockResolvedValue({ content: [], number: 0 }) },
    tokens,
  );

  await expect(gateway.loadPage(0)).rejects.toMatchObject({
    category: 'unknown',
  });
});
