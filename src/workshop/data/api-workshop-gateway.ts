import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import type { WorkshopDetails, WorkshopSummary } from '@/workshop/domain';

type TaxonomyResponse = Readonly<{
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}>;

type WorkshopResponse = Readonly<{
  id: string;
  title: string;
  description: string;
  image: string | null;
  themeId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  modality: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  price: number;
  registrationStart: string;
  registrationEnd: string;
  maximumParticipants: number;
  paymentMethod: string;
  championship: boolean;
  additionalInformation: string | null;
  status: string;
  scheduledPublishAt: string | null;
  publishedAt: string | null;
  createdBy: string;
}>;

type PageResponse = Readonly<{
  content: readonly WorkshopResponse[];
  number: number;
  last: boolean;
}>;

type AttachmentResponse = Readonly<{
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  checksumSha256: string;
  createdAt: string;
}>;

export type WorkshopGateway = Readonly<{
  getCurrentUserId(): Promise<string>;
  loadList(): Promise<readonly WorkshopSummary[]>;
  loadDetails(id: string): Promise<WorkshopDetails>;
}>;

export function createApiWorkshopGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): WorkshopGateway {
  const authenticated = async <T>(path: string): Promise<T> => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    return http.request<T>({
      path,
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
  };

  return {
    async getCurrentUserId() {
      const profile = await authenticated<unknown>('/users/me');
      if (
        !profile ||
        typeof profile !== 'object' ||
        !('id' in profile) ||
        typeof profile.id !== 'string'
      ) {
        throw invalidResponse('profile');
      }
      return profile.id;
    },
    async loadList() {
      const [themes, categories] = await Promise.all([
        loadTaxonomies(authenticated, '/themes'),
        loadTaxonomies(authenticated, '/categories'),
      ]);
      const workshops = await loadAllWorkshops(authenticated);
      const themeNames = new Map(themes.map((theme) => [theme.id, theme.name]));
      const categoryNames = new Map(
        categories.map((category) => [category.id, category.name]),
      );
      return workshops.map((workshop) =>
        toSummary(workshop, themeNames, categoryNames),
      );
    },
    async loadDetails(id) {
      if (!id.trim()) throw new AppError({ category: 'bad_request' });
      const encodedId = encodeURIComponent(id);
      const [response, attachments, themes, categories] = await Promise.all([
        authenticated<unknown>(`/workshops/${encodedId}`),
        authenticated<unknown>(`/workshops/${encodedId}/attachments`),
        loadTaxonomies(authenticated, '/themes'),
        loadTaxonomies(authenticated, '/categories'),
      ]);
      if (!isWorkshopResponse(response)) throw invalidResponse('workshop');
      if (
        !Array.isArray(attachments) ||
        !attachments.every(isAttachmentResponse)
      ) {
        throw invalidResponse('attachments');
      }
      const theme = themes.find((entry) => entry.id === response.themeId)?.name;
      const category = categories.find(
        (entry) => entry.id === response.categoryId,
      )?.name;
      return toDetails(response, attachments, theme, category);
    },
  };
}

async function loadTaxonomies(
  request: <T>(path: string) => Promise<T>,
  path: string,
) {
  const response = await request<unknown>(path);
  if (!Array.isArray(response) || !response.every(isTaxonomyResponse))
    throw invalidResponse(path.slice(1));
  return response;
}

async function loadAllWorkshops(request: <T>(path: string) => Promise<T>) {
  const workshops: WorkshopResponse[] = [];
  let page = 0;
  while (true) {
    const response = await request<unknown>(
      `/workshops?status=PUBLISHED&page=${page}&size=100`,
    );
    if (!isPageResponse(response)) throw invalidResponse('workshops');
    workshops.push(...response.content);
    if (response.last) return workshops;
    page = response.number + 1;
  }
}

function toSummary(
  workshop: WorkshopResponse,
  themeNames: ReadonlyMap<string, string>,
  categoryNames: ReadonlyMap<string, string>,
): WorkshopSummary {
  const theme = themeNames.get(workshop.themeId);
  const category = categoryNames.get(workshop.categoryId);
  return {
    id: workshop.id,
    title: workshop.title,
    description: workshop.description,
    ...(theme ? { theme } : category ? { theme: category } : {}),
    scheduleLabel: formatSchedule(workshop),
    locationLabel: workshop.location,
    modality: formatModality(workshop.modality),
    priceLabel:
      workshop.price === 0
        ? 'Gratuito'
        : new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(workshop.price),
    registrationLabel: `Inscrições até ${formatDate(workshop.registrationEnd.slice(0, 10))}`,
  };
}

function toDetails(
  workshop: WorkshopResponse,
  attachments: readonly AttachmentResponse[],
  theme?: string,
  category?: string,
): WorkshopDetails {
  return {
    id: workshop.id,
    title: workshop.title,
    description: workshop.description,
    ...(theme ? { theme } : {}),
    ...(category ? { category } : {}),
    dateLabel:
      workshop.startDate === workshop.endDate
        ? formatDate(workshop.startDate)
        : `${formatDate(workshop.startDate)} a ${formatDate(workshop.endDate)}`,
    timeLabel: `${formatTime(workshop.startTime)}–${formatTime(workshop.endTime)}`,
    location: workshop.location,
    modality: formatModality(workshop.modality),
    priceLabel:
      workshop.price === 0
        ? 'Gratuito'
        : new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(workshop.price),
    registrationPeriodLabel: `${formatDate(workshop.registrationStart.slice(0, 10))} a ${formatDate(workshop.registrationEnd.slice(0, 10))}`,
    capacityLabel: `${workshop.maximumParticipants} vagas`,
    attachments: attachments.map((attachment) => ({
      id: attachment.id,
      name: attachment.filename,
    })),
    ...(workshop.additionalInformation
      ? { additionalInformation: workshop.additionalInformation }
      : {}),
  };
}

function formatSchedule(workshop: WorkshopResponse) {
  const dates =
    workshop.startDate === workshop.endDate
      ? formatDate(workshop.startDate)
      : `${formatDate(workshop.startDate)} a ${formatDate(workshop.endDate)}`;
  return `${dates}, ${formatTime(workshop.startTime)}–${formatTime(workshop.endTime)}`;
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function formatModality(value: WorkshopResponse['modality']) {
  return { IN_PERSON: 'Presencial', ONLINE: 'Online', HYBRID: 'Híbrido' }[
    value
  ];
}

function isPageResponse(value: unknown): value is PageResponse {
  if (!value || typeof value !== 'object') return false;
  const page = value as Partial<PageResponse>;
  return (
    Array.isArray(page.content) &&
    page.content.every(isWorkshopResponse) &&
    typeof page.number === 'number' &&
    typeof page.last === 'boolean'
  );
}

function isTaxonomyResponse(value: unknown): value is TaxonomyResponse {
  if (!value || typeof value !== 'object') return false;
  const taxonomy = value as Partial<TaxonomyResponse>;
  return (
    typeof taxonomy.id === 'string' &&
    typeof taxonomy.name === 'string' &&
    (taxonomy.description === null ||
      typeof taxonomy.description === 'string') &&
    typeof taxonomy.active === 'boolean'
  );
}

function isAttachmentResponse(value: unknown): value is AttachmentResponse {
  if (!value || typeof value !== 'object') return false;
  const attachment = value as Partial<AttachmentResponse>;
  return (
    typeof attachment.id === 'string' &&
    typeof attachment.filename === 'string' &&
    typeof attachment.contentType === 'string' &&
    typeof attachment.sizeBytes === 'number' &&
    typeof attachment.checksumSha256 === 'string' &&
    typeof attachment.createdAt === 'string'
  );
}

function isWorkshopResponse(value: unknown): value is WorkshopResponse {
  if (!value || typeof value !== 'object') return false;
  const workshop = value as Partial<WorkshopResponse>;
  return (
    typeof workshop.id === 'string' &&
    typeof workshop.title === 'string' &&
    typeof workshop.description === 'string' &&
    (workshop.image === null || typeof workshop.image === 'string') &&
    typeof workshop.themeId === 'string' &&
    typeof workshop.categoryId === 'string' &&
    typeof workshop.startDate === 'string' &&
    typeof workshop.endDate === 'string' &&
    typeof workshop.startTime === 'string' &&
    typeof workshop.endTime === 'string' &&
    typeof workshop.location === 'string' &&
    ['IN_PERSON', 'ONLINE', 'HYBRID'].includes(workshop.modality ?? '') &&
    typeof workshop.price === 'number' &&
    typeof workshop.registrationStart === 'string' &&
    typeof workshop.registrationEnd === 'string' &&
    typeof workshop.maximumParticipants === 'number' &&
    typeof workshop.paymentMethod === 'string' &&
    typeof workshop.championship === 'boolean' &&
    (workshop.additionalInformation === null ||
      typeof workshop.additionalInformation === 'string') &&
    typeof workshop.status === 'string' &&
    (workshop.scheduledPublishAt === null ||
      typeof workshop.scheduledPublishAt === 'string') &&
    (workshop.publishedAt === null ||
      typeof workshop.publishedAt === 'string') &&
    typeof workshop.createdBy === 'string'
  );
}

function invalidResponse(resource: string) {
  return new AppError({
    category: 'unknown',
    technicalMessage: `Invalid ${resource} response.`,
  });
}
