import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import type { NotificationItem, NotificationPage } from '@/notification/domain';

export type NotificationGateway = Readonly<{
  loadPage(page: number, size?: number): Promise<NotificationPage>;
  markRead(id: string): Promise<NotificationItem>;
  registerDevice(token: string, platform: 'ANDROID' | 'IOS'): Promise<string>;
  unregisterDevice(id: string): Promise<void>;
}>;

export function createApiNotificationGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): NotificationGateway {
  const request = async <T>(path: string, method = 'GET', body?: unknown) => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    return http.request<T>({
      path,
      ...(method === 'GET' ? {} : { method }),
      ...(body === undefined ? {} : { body }),
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
  };

  return {
    async loadPage(page, size = 20) {
      const response = await request<unknown>(
        `/notifications?page=${page}&size=${size}`,
      );
      if (!isPage(response)) throw invalidResponse();
      return {
        items: response.content,
        page: response.number,
        hasMore: !response.last,
      };
    },
    async markRead(id) {
      if (!id.trim()) throw new AppError({ category: 'bad_request' });
      const response = await request<unknown>(
        `/notifications/${encodeURIComponent(id)}/read`,
        'PATCH',
      );
      if (!isNotification(response)) throw invalidResponse();
      return response;
    },
    async registerDevice(token, platform) {
      if (!token.trim()) throw new AppError({ category: 'bad_request' });
      const response = await request<unknown>('/notification-devices', 'POST', {
        token,
        platform,
      });
      if (!isDevice(response)) throw invalidResponse();
      return response.id;
    },
    async unregisterDevice(id) {
      if (!id.trim()) throw new AppError({ category: 'bad_request' });
      await request<void>(
        `/notification-devices/${encodeURIComponent(id)}`,
        'DELETE',
      );
    },
  };
}

export function mergeNotifications(
  current: readonly NotificationItem[],
  incoming: readonly NotificationItem[],
) {
  const known = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !known.has(item.id))];
}

export function updateNotificationRead(
  items: readonly NotificationItem[],
  id: string,
  read: boolean,
) {
  return items.map((item) => (item.id === id ? { ...item, read } : item));
}

function isPage(
  value: unknown,
): value is { content: NotificationItem[]; number: number; last: boolean } {
  if (!value || typeof value !== 'object') return false;
  const page = value as { content?: unknown; number?: unknown; last?: unknown };
  return (
    Array.isArray(page.content) &&
    page.content.every(isNotification) &&
    typeof page.number === 'number' &&
    typeof page.last === 'boolean'
  );
}

function isNotification(value: unknown): value is NotificationItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<NotificationItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    typeof item.title === 'string' &&
    typeof item.message === 'string' &&
    typeof item.read === 'boolean' &&
    typeof item.createdAt === 'string' &&
    !!item.data &&
    typeof item.data === 'object' &&
    !Array.isArray(item.data) &&
    Object.values(item.data).every((entry) => typeof entry === 'string')
  );
}

function isDevice(
  value: unknown,
): value is { id: string; platform: string; active: boolean } {
  if (!value || typeof value !== 'object') return false;
  const device = value as {
    id?: unknown;
    platform?: unknown;
    active?: unknown;
  };
  return (
    typeof device.id === 'string' &&
    typeof device.platform === 'string' &&
    typeof device.active === 'boolean'
  );
}

function invalidResponse() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Invalid notifications response.',
  });
}
