import { AppError, toAppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import type {
  AttendanceStatus,
  Dashboard,
  ManagedParticipant,
  ManagedWorkshop,
  PostInput,
  Taxonomy,
  WorkshopInput,
  WorkshopPayment,
  WorkshopStatus,
  WorkshopTransition,
} from './admin';
import { guessType, type PickedFile, type WorkshopFile } from './media';

type PageOf<T> = Readonly<{ content: T[]; number: number; last: boolean }>;

export function createApiAdminGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
  apiUrl?: string,
) {
  /** Multipart upload; the JSON HTTP client cannot send a form body. */
  const upload = async (path: string, file: PickedFile) => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    if (!apiUrl) throw new AppError({ category: 'bad_request' });
    const form = new FormData();
    if (file.file) form.append('file', file.file, file.name);
    else
      form.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? guessType(file.name),
      } as unknown as Blob);
    let response: Response;
    try {
      response = await fetch(`${apiUrl}${path}`, {
        method: 'POST',
        // No Content-Type: fetch adds the multipart boundary itself.
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        body: form,
      });
    } catch {
      throw new AppError({ category: 'network' });
    }
    if (!response.ok)
      throw toAppError(
        new AppError({ category: 'unknown', status: response.status }),
      );
  };

  const request = async <T>(
    path: string,
    method = 'GET',
    body?: unknown,
    headers: Record<string, string> = {},
  ) => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    return http.request<T>({
      path,
      ...(method === 'GET' ? {} : { method }),
      ...(body === undefined ? {} : { body }),
      headers: { Authorization: `Bearer ${tokens.accessToken}`, ...headers },
    });
  };
  const page = <T>(value: unknown, guard: (item: unknown) => item is T) => {
    if (!isPageOf(value, guard)) throw invalidResponse('page');
    return {
      items: value.content,
      page: value.number,
      hasMore: !value.last,
    };
  };

  return {
    async dashboard(): Promise<Dashboard> {
      const value = await request<unknown>('/arweg/dashboard');
      if (!isDashboard(value)) throw invalidResponse('dashboard');
      return value;
    },
    async listWorkshops(
      options: { status?: WorkshopStatus; page?: number; size?: number } = {},
    ) {
      const query = new URLSearchParams({
        page: String(options.page ?? 0),
        size: String(options.size ?? 20),
        ...(options.status ? { status: options.status } : {}),
      });
      return page(
        await request<unknown>(`/workshops?${query}`),
        isManagedWorkshop,
      );
    },
    async loadWorkshop(id: string): Promise<ManagedWorkshop> {
      const value = await request<unknown>(`/workshops/${encodeId(id)}`);
      if (!isManagedWorkshop(value)) throw invalidResponse('workshop');
      return value;
    },
    async createWorkshop(input: WorkshopInput): Promise<ManagedWorkshop> {
      const value = await request<unknown>('/workshops', 'POST', input);
      if (!isManagedWorkshop(value)) throw invalidResponse('workshop');
      return value;
    },
    async updateWorkshop(
      id: string,
      input: WorkshopInput,
    ): Promise<ManagedWorkshop> {
      const value = await request<unknown>(
        `/workshops/${encodeId(id)}`,
        'PUT',
        input,
      );
      if (!isManagedWorkshop(value)) throw invalidResponse('workshop');
      return value;
    },
    async transition(
      id: string,
      action: WorkshopTransition,
    ): Promise<ManagedWorkshop> {
      const value = await request<unknown>(
        `/workshops/${encodeId(id)}/${action}`,
        'PATCH',
      );
      if (!isManagedWorkshop(value)) throw invalidResponse('workshop');
      return value;
    },
    async schedule(id: string, scheduledPublishAt: string) {
      const value = await request<unknown>(
        `/workshops/${encodeId(id)}/schedule`,
        'PATCH',
        { scheduledPublishAt },
      );
      if (!isManagedWorkshop(value)) throw invalidResponse('workshop');
      return value;
    },
    async participants(id: string, pageNumber = 0, size = 50) {
      return page(
        await request<unknown>(
          `/arweg/workshops/${encodeId(id)}/participants?page=${pageNumber}&size=${size}`,
        ),
        isParticipant,
      );
    },
    async markAttendance(
      id: string,
      updates: readonly { registrationId: string; status: AttendanceStatus }[],
    ) {
      await request<unknown>(
        `/arweg/workshops/${encodeId(id)}/attendance`,
        'PATCH',
        { updates },
      );
    },
    async payments(id: string): Promise<WorkshopPayment[]> {
      const value = await request<unknown>(
        `/arweg/workshops/${encodeId(id)}/payments`,
      );
      if (!Array.isArray(value) || !value.every(isPayment))
        throw invalidResponse('payments');
      return value;
    },
    async simulatePayment(paymentId: string, outcome: 'paid' | 'declined') {
      await request<unknown>(
        `/payments/${encodeId(paymentId)}/simulate/${outcome}`,
        'PATCH',
      );
    },
    async sendAnnouncement(input: {
      userIds: readonly string[];
      title: string;
      message: string;
      workshopId?: string;
    }) {
      await request<unknown>('/arweg/notifications', 'POST', {
        userIds: input.userIds,
        title: input.title,
        message: input.message,
        ...(input.workshopId ? { data: { workshopId: input.workshopId } } : {}),
      });
    },
    async createTaxonomy(kind: 'themes' | 'categories', name: string) {
      await request<unknown>(`/admin/${kind}`, 'POST', { name });
    },
    async updateTaxonomy(
      kind: 'themes' | 'categories',
      id: string,
      changes: { name?: string; active?: boolean },
    ) {
      await request<unknown>(
        `/admin/${kind}/${encodeId(id)}`,
        'PATCH',
        changes,
      );
    },
    async attachments(id: string): Promise<WorkshopFile[]> {
      const value = await request<unknown>(
        `/workshops/${encodeId(id)}/attachments`,
      );
      if (!Array.isArray(value) || !value.every(isWorkshopFile))
        throw invalidResponse('attachments');
      return value;
    },
    uploadImage: (id: string, file: PickedFile) =>
      upload(`/workshops/${encodeId(id)}/image`, file),
    uploadAttachment: (id: string, file: PickedFile) =>
      upload(`/workshops/${encodeId(id)}/attachments`, file),
    async deleteImage(id: string) {
      await request<unknown>(`/workshops/${encodeId(id)}/image`, 'DELETE');
    },
    async deleteAttachment(id: string, attachmentId: string) {
      await request<unknown>(
        `/workshops/${encodeId(id)}/attachments/${encodeId(attachmentId)}`,
        'DELETE',
      );
    },
    async themes(): Promise<Taxonomy[]> {
      const value = await request<unknown>('/themes');
      if (!Array.isArray(value) || !value.every(isTaxonomy))
        throw invalidResponse('themes');
      return value;
    },
    async categories(): Promise<Taxonomy[]> {
      const value = await request<unknown>('/categories');
      if (!Array.isArray(value) || !value.every(isTaxonomy))
        throw invalidResponse('categories');
      return value;
    },
    async createPost(input: PostInput): Promise<string> {
      const value = await request<unknown>('/posts', 'POST', input);
      if (!isRecord(value) || typeof value.id !== 'string')
        throw invalidResponse('post');
      return value.id;
    },
    async publishPost(id: string) {
      await request<unknown>(`/posts/${encodeId(id)}/publish`, 'PATCH');
    },
    async schedulePost(id: string, scheduledPublishAt: string) {
      await request<unknown>(`/posts/${encodeId(id)}/schedule`, 'PATCH', {
        scheduledPublishAt,
      });
    },
  };
}

export type AdminGateway = ReturnType<typeof createApiAdminGateway>;

function encodeId(id: string) {
  if (!id.trim()) throw new AppError({ category: 'bad_request' });
  return encodeURIComponent(id);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}
function isPageOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): value is PageOf<T> {
  return (
    isRecord(value) &&
    Array.isArray(value.content) &&
    value.content.every(guard) &&
    typeof value.number === 'number' &&
    typeof value.last === 'boolean'
  );
}
function isDashboard(value: unknown): value is Dashboard {
  return (
    isRecord(value) &&
    [
      'workshops',
      'publishedWorkshops',
      'registrations',
      'confirmedRegistrations',
      'waitingListRegistrations',
      'attendedRegistrations',
    ].every((key) => typeof value[key] === 'number')
  );
}
function isManagedWorkshop(value: unknown): value is ManagedWorkshop {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.status === 'string' &&
    typeof value.startDate === 'string' &&
    typeof value.maximumParticipants === 'number'
  );
}
function isParticipant(value: unknown): value is ManagedParticipant {
  return (
    isRecord(value) &&
    typeof value.registrationId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.registrationStatus === 'string' &&
    typeof value.paymentStatus === 'string'
  );
}
function isPayment(value: unknown): value is WorkshopPayment {
  return (
    isRecord(value) &&
    typeof value.paymentId === 'string' &&
    typeof value.registrationId === 'string' &&
    typeof value.status === 'string'
  );
}
function isWorkshopFile(value: unknown): value is WorkshopFile {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.filename === 'string' &&
    typeof value.sizeBytes === 'number'
  );
}
function isTaxonomy(value: unknown): value is Taxonomy {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  );
}
function invalidResponse(resource: string) {
  return new AppError({
    category: 'unknown',
    technicalMessage: `Invalid admin ${resource} response.`,
  });
}
