import { createApiChatGateway } from '@/chat';

const storage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};
const message = {
  id: 'message-1',
  groupId: 'group-1',
  authorId: 'user-1',
  authorName: 'Ana',
  content: 'Olá',
  sentAt: '2026-10-02T12:00:00Z',
  editedAt: null,
  deletedAt: null,
};

it('loads cursor-paginated history and sends authenticated messages', async () => {
  const request = jest
    .fn()
    .mockResolvedValueOnce({
      content: [message],
      nextCursor: 'message-1',
      hasMore: true,
    })
    .mockResolvedValueOnce(message);
  const gateway = createApiChatGateway({ request }, storage);
  await expect(gateway.load('group/1', 'cursor/1')).resolves.toEqual({
    items: [message],
    nextCursor: 'message-1',
    hasMore: true,
  });
  await expect(
    gateway.send('group/1', ' Olá ', 'operation-1'),
  ).resolves.toEqual(message);
  expect(request).toHaveBeenNthCalledWith(1, {
    path: '/groups/group%2F1/messages?size=20&cursor=cursor%2F1',
    headers: { Authorization: 'Bearer access' },
  });
  expect(request).toHaveBeenNthCalledWith(2, {
    path: '/groups/group%2F1/messages',
    method: 'POST',
    body: { content: 'Olá' },
    headers: {
      Authorization: 'Bearer access',
      'Idempotency-Key': 'operation-1',
    },
  });
});

it('soft-deletes an own message through the persistent API', async () => {
  const deleted = {
    ...message,
    content: null,
    deletedAt: '2026-10-02T12:01:00Z',
  };
  const request = jest.fn().mockResolvedValue(deleted);
  const gateway = createApiChatGateway({ request }, storage);
  await expect(gateway.delete('group-1', 'message-1')).resolves.toEqual(
    deleted,
  );
});
