import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import type {
  ParticipantWorkshopFilter,
  ParticipantWorkshopPage,
} from './participant-workshop';

type WorkshopResponse = Readonly<{
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  modality: string;
}>;

export function createParticipantWorkshopGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
) {
  const load = async (
    path: string,
    historyStatus?: ParticipantWorkshopFilter,
  ): Promise<ParticipantWorkshopPage> => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    const response = await http.request<unknown>({
      path,
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!isPage(response)) throw invalidResponse();
    return {
      items: historyStatus
        ? response.content.map((item) => ({ ...item, historyStatus }))
        : response.content,
      page: response.number,
      hasMore: !response.last,
    };
  };
  return {
    loadHistory(
      filter: ParticipantWorkshopFilter = 'COMPLETED',
      page = 0,
      size = 20,
    ) {
      return load(
        `/users/me/workshops/history?filter=${filter}&page=${page}&size=${size}`,
        filter,
      );
    },
    loadCalendar(
      input: { from?: string; to?: string; page?: number; size?: number } = {},
    ) {
      const query = new URLSearchParams({
        page: String(input.page ?? 0),
        size: String(input.size ?? 20),
        ...(input.from ? { from: input.from } : {}),
        ...(input.to ? { to: input.to } : {}),
      });
      return load(`/users/me/workshops/calendar?${query}`);
    },
  };
}

function isPage(
  value: unknown,
): value is { content: WorkshopResponse[]; number: number; last: boolean } {
  if (!value || typeof value !== 'object') return false;
  const page = value as { content?: unknown; number?: unknown; last?: unknown };
  return (
    Array.isArray(page.content) &&
    page.content.every(isWorkshop) &&
    typeof page.number === 'number' &&
    typeof page.last === 'boolean'
  );
}

function isWorkshop(value: unknown): value is WorkshopResponse {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<WorkshopResponse>;
  return [
    'id',
    'title',
    'description',
    'startDate',
    'endDate',
    'startTime',
    'endTime',
    'location',
    'modality',
  ].every((key) => typeof item[key as keyof WorkshopResponse] === 'string');
}

function invalidResponse() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Invalid participant workshop response.',
  });
}
