import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import type { GroupPage, WorkshopGroup } from './group';

export function createApiGroupGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
) {
  const request = async (path: string) => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    return http.request<unknown>({
      path,
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
  };
  return {
    async loadPage(page = 0, size = 20): Promise<GroupPage> {
      const value = await request(`/groups?page=${page}&size=${size}`);
      if (!isPage(value)) throw invalidResponse();
      return { items: value.content, page: value.number, hasMore: !value.last };
    },
    async load(id: string): Promise<WorkshopGroup> {
      if (!id.trim()) throw new AppError({ category: 'bad_request' });
      const value = await request(`/groups/${encodeURIComponent(id)}`);
      if (!isGroup(value)) throw invalidResponse();
      return value;
    },
  };
}

function isPage(
  value: unknown,
): value is { content: WorkshopGroup[]; number: number; last: boolean } {
  if (!value || typeof value !== 'object') return false;
  const page = value as { content?: unknown; number?: unknown; last?: unknown };
  return (
    Array.isArray(page.content) &&
    page.content.every(isGroup) &&
    typeof page.number === 'number' &&
    typeof page.last === 'boolean'
  );
}
function isGroup(value: unknown): value is WorkshopGroup {
  if (!value || typeof value !== 'object') return false;
  const group = value as Partial<WorkshopGroup>;
  return (
    typeof group.id === 'string' &&
    typeof group.workshopId === 'string' &&
    typeof group.workshopTitle === 'string' &&
    typeof group.active === 'boolean' &&
    typeof group.canSendMessages === 'boolean' &&
    typeof group.canModerate === 'boolean' &&
    typeof group.updatedAt === 'string'
  );
}
function invalidResponse() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Invalid group response.',
  });
}
