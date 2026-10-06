jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));

import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import {
  createApiFeedGateway,
  mergeFeedItems,
  updateFeedLike,
} from '@/feed/data';

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
        image: 'https://cdn.example.test/highlight.webp',
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
  expect(page.items[0]).toMatchObject({
    imageUrl: 'https://cdn.example.test/highlight.webp',
  });
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

it('finds the published post linked to a workshop across feed pages', async () => {
  const request = jest
    .fn()
    .mockResolvedValueOnce({
      content: [
        {
          id: 'unrelated',
          title: 'Outro post',
          content: 'Conteúdo',
          workshopId: null,
          highlight: false,
          publishedAt: '2026-10-01T12:00:00Z',
          likeCount: 0,
          likedByMe: false,
        },
      ],
      number: 0,
      last: false,
    })
    .mockResolvedValueOnce({
      content: [
        {
          id: 'discussion-post',
          title: 'Workshop',
          content: 'Discussão',
          workshopId: 'workshop-1',
          highlight: false,
          publishedAt: '2026-10-02T12:00:00Z',
          likeCount: 1,
          likedByMe: false,
        },
      ],
      number: 1,
      last: true,
    });
  const gateway = createApiFeedGateway({ request } as HttpClient, tokens);

  await expect(gateway.findPostIdForWorkshop('workshop-1')).resolves.toBe(
    'discussion-post',
  );
  expect(request).toHaveBeenNthCalledWith(1, {
    path: '/posts/feed?page=0&size=100',
    headers: { Authorization: 'Bearer access' },
  });
  expect(request).toHaveBeenNthCalledWith(2, {
    path: '/posts/feed?page=1&size=100',
    headers: { Authorization: 'Bearer access' },
  });
});

it.each([
  [true, 'PUT'],
  [false, 'DELETE'],
] as const)(
  'uses the idempotent like endpoint (liked: %s)',
  async (liked, method) => {
    const request = jest.fn().mockResolvedValue(undefined);
    const gateway = createApiFeedGateway({ request } as HttpClient, tokens);

    await gateway.setLiked('post/id', liked);

    expect(request).toHaveBeenCalledWith({
      path: '/posts/post%2Fid/like',
      method,
      headers: { Authorization: 'Bearer access' },
    });
  },
);

it('can apply and roll back the optimistic like state', () => {
  const items = [
    {
      id: 'post-id',
      kind: 'post' as const,
      title: 'Post',
      likedByMe: false,
      likeCount: 2,
    },
  ];

  const optimistic = updateFeedLike(items, 'post-id', true, 3);
  const rolledBack = updateFeedLike(optimistic, 'post-id', false, 2);

  expect(optimistic[0]).toMatchObject({ likedByMe: true, likeCount: 3 });
  expect(rolledBack).toEqual(items);
});
