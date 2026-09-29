jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import { createApiWorkshopGateway } from '@/workshop/data';

const tokens: TokenStorage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};

const workshop = {
  id: 'workshop-1',
  title: 'Lean Manufacturing',
  description: 'Melhoria contínua',
  image: null,
  themeId: 'theme-1',
  categoryId: 'category-1',
  startDate: '2026-10-10',
  endDate: '2026-10-10',
  startTime: '09:00:00',
  endTime: '12:00:00',
  location: 'Auditório',
  modality: 'IN_PERSON',
  price: 0,
  registrationStart: '2026-09-01T00:00:00Z',
  registrationEnd: '2026-10-08T23:59:59Z',
  maximumParticipants: 20,
  paymentMethod: 'EXEMPT',
  championship: false,
  additionalInformation: null,
  status: 'PUBLISHED',
  scheduledPublishAt: null,
  publishedAt: '2026-09-01T00:00:00Z',
  createdBy: 'user-1',
};

it('loads published workshops and maps API metadata for the list', async () => {
  const request = jest.fn(async ({ path }: { path: string }) => {
    if (path === '/themes')
      return [
        {
          id: 'theme-1',
          name: 'Excelência operacional',
          description: null,
          active: true,
        },
      ];
    if (path === '/categories')
      return [
        {
          id: 'category-1',
          name: 'Indústria',
          description: null,
          active: true,
        },
      ];
    return { content: [workshop], number: 0, last: true };
  });
  const gateway = createApiWorkshopGateway({ request } as HttpClient, tokens);

  await expect(gateway.loadList()).resolves.toEqual([
    expect.objectContaining({
      id: 'workshop-1',
      title: 'Lean Manufacturing',
      theme: 'Excelência operacional',
      scheduleLabel: '10/10/2026, 09:00–12:00',
      modality: 'Presencial',
      priceLabel: 'Gratuito',
      registrationLabel: 'Inscrições até 08/10/2026',
    }),
  ]);
  expect(request).toHaveBeenCalledWith({
    path: '/workshops?status=PUBLISHED&page=0&size=100',
    headers: { Authorization: 'Bearer access' },
  });
});

it('loads all API pages without changing their order', async () => {
  const request = jest.fn(async ({ path }: { path: string }) => {
    if (path === '/themes' || path === '/categories') return [];
    if (path.includes('page=0'))
      return { content: [workshop], number: 0, last: false };
    return {
      content: [{ ...workshop, id: 'workshop-2', title: 'Segundo' }],
      number: 1,
      last: true,
    };
  });
  const gateway = createApiWorkshopGateway({ request } as HttpClient, tokens);

  await expect(gateway.loadList()).resolves.toEqual([
    expect.objectContaining({ id: 'workshop-1' }),
    expect.objectContaining({ id: 'workshop-2' }),
  ]);
});

it('sends status, theme and category filters supported by the API', async () => {
  const request = jest.fn(async ({ path }: { path: string }) => {
    if (path === '/themes' || path === '/categories') return [];
    return { content: [], number: 0, last: true };
  });
  const gateway = createApiWorkshopGateway({ request } as HttpClient, tokens);

  await gateway.loadList({
    status: 'CLOSED',
    themeId: 'theme/1',
    categoryId: 'category 1',
  });

  expect(request).toHaveBeenCalledWith({
    path: '/workshops?status=CLOSED&themeId=theme%2F1&categoryId=category+1&page=0&size=100',
    headers: { Authorization: 'Bearer access' },
  });
});

it('loads active theme and category filter options', async () => {
  const request = jest.fn(async ({ path }: { path: string }) => [
    {
      id: path === '/themes' ? 'theme-1' : 'category-1',
      name: path === '/themes' ? 'Lean' : 'Indústria',
      description: null,
      active: true,
    },
  ]);
  const gateway = createApiWorkshopGateway({ request } as HttpClient, tokens);

  await expect(gateway.loadFilterOptions()).resolves.toEqual({
    themes: [{ id: 'theme-1', name: 'Lean' }],
    categories: [{ id: 'category-1', name: 'Indústria' }],
  });
});

it('rejects malformed workshop pages', async () => {
  const request = jest.fn(async ({ path }: { path: string }) => {
    if (path === '/themes' || path === '/categories') return [];
    return { content: [], number: 0 };
  });
  const gateway = createApiWorkshopGateway({ request } as HttpClient, tokens);

  await expect(gateway.loadList()).rejects.toMatchObject({
    category: 'unknown',
  });
});

it('loads workshop details with taxonomy names and attachments', async () => {
  const request = jest.fn(async ({ path }: { path: string }) => {
    if (path === '/themes')
      return [
        {
          id: 'theme-1',
          name: 'Excelência operacional',
          description: null,
          active: true,
        },
      ];
    if (path === '/categories')
      return [
        {
          id: 'category-1',
          name: 'Indústria',
          description: null,
          active: true,
        },
      ];
    if (path.endsWith('/attachments'))
      return [
        {
          id: 'attachment-1',
          filename: 'material.png',
          contentType: 'image/png',
          sizeBytes: 100,
          checksumSha256: 'checksum',
          createdAt: '2026-09-29T12:00:00Z',
        },
      ];
    return workshop;
  });
  const gateway = createApiWorkshopGateway({ request } as HttpClient, tokens);

  await expect(gateway.loadDetails('workshop/1')).resolves.toEqual({
    id: 'workshop-1',
    title: 'Lean Manufacturing',
    description: 'Melhoria contínua',
    theme: 'Excelência operacional',
    category: 'Indústria',
    dateLabel: '10/10/2026',
    timeLabel: '09:00–12:00',
    location: 'Auditório',
    modality: 'Presencial',
    priceLabel: 'Gratuito',
    registrationPeriodLabel: '01/09/2026 a 08/10/2026',
    capacityLabel: '20 vagas',
    attachments: [
      {
        id: 'attachment-1',
        name: 'material.png',
        contentType: 'image/png',
      },
    ],
  });
  expect(request).toHaveBeenCalledWith({
    path: '/workshops/workshop%2F1',
    headers: { Authorization: 'Bearer access' },
  });
});

it('rejects malformed attachment metadata', async () => {
  const request = jest.fn(async ({ path }: { path: string }) => {
    if (path === '/themes' || path === '/categories') return [];
    if (path.endsWith('/attachments')) return [{ id: 'incomplete' }];
    return workshop;
  });
  const gateway = createApiWorkshopGateway({ request } as HttpClient, tokens);

  await expect(gateway.loadDetails('workshop-1')).rejects.toMatchObject({
    category: 'unknown',
  });
});
