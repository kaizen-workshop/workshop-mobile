jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import { createApiFeedGateway, mergeFeedItems } from '@/feed/data';

const tokens: TokenStorage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};

it('maps the API page without changing its authoritative order', async () => {
  const request = jest.fn().mockResolvedValue({
    content: [
      {
        id: 'highlight',
        title: 'Destaque',
        content: 'Primeiro',
        workshopId: 'workshop-id',
        highlight: true,
        publishedAt: '2026-09-29T12:00:00Z',
        likeCount: 4,
        likedByMe: true,
      },
      {
        id: 'recent',
        title: 'Recente',
        content: 'Segundo',
        workshopId: null,
        highlight: false,
        publishedAt: null,
        likeCount: 0,
        likedByMe: false,
      },
    ],
    number: 0,
    last: false,
  });
  const gateway = createApiFeedGateway({ request } as HttpClient, tokens);

  const page = await gateway.loadPage(0);

  expect(page.items.map((item) => item.id)).toEqual(['highlight', 'recent']);
  expect(page).toMatchObject({ page: 0, hasMore: true });
  expect(request).toHaveBeenCalledWith({
    path: '/posts/feed?page=0&size=20',
    headers: { Authorization: 'Bearer access' },
  });
});

it('deduplicates overlapping pages while preserving order', () => {
  const first = [{ id: 'one', kind: 'post' as const, title: 'One' }];
  const next = [
    { id: 'one', kind: 'post' as const, title: 'One updated' },
    { id: 'two', kind: 'post' as const, title: 'Two' },
  ];

  expect(mergeFeedItems(first, next).map((item) => item.id)).toEqual([
    'one',
    'two',
  ]);
});

it('rejects malformed pages instead of rendering invented defaults', async () => {
  const gateway = createApiFeedGateway(
    { request: jest.fn().mockResolvedValue({ content: [] }) },
    tokens,
  );

  await expect(gateway.loadPage(0)).rejects.toMatchObject({
    category: 'unknown',
  });
});

it('uses the requested page and stops after the API last page', async () => {
  const request = jest.fn().mockResolvedValue({
    content: [],
    number: 2,
    last: true,
  });
  const gateway = createApiFeedGateway({ request } as HttpClient, tokens);

  await expect(gateway.loadPage(2, 10)).resolves.toEqual({
    items: [],
    page: 2,
    hasMore: false,
  });
  expect(request).toHaveBeenCalledWith({
    path: '/posts/feed?page=2&size=10',
    headers: { Authorization: 'Bearer access' },
  });
});
