import { createApiCommentGateway } from '@/feed/data/api-comment-gateway';

const storage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};
const comment = {
  id: 'comment-1',
  userId: 'user-1',
  content: 'Bom conteúdo',
  createdAt: '2026-10-02T12:00:00Z',
  updatedAt: '2026-10-02T12:00:00Z',
};

it('lists, creates, edits and deletes comments supported by the API', async () => {
  const request = jest
    .fn()
    .mockResolvedValueOnce({ content: [comment], number: 0, last: true })
    .mockResolvedValueOnce(comment)
    .mockResolvedValueOnce({ ...comment, content: 'Atualizado' })
    .mockResolvedValueOnce(undefined);
  const gateway = createApiCommentGateway({ request }, storage);

  await expect(gateway.load('post-1')).resolves.toMatchObject({
    items: [comment],
  });
  await expect(
    gateway.create('post-1', ' Bom conteúdo ', 'operation-1'),
  ).resolves.toEqual(comment);
  expect(request).toHaveBeenNthCalledWith(2, {
    path: '/posts/post-1/comments',
    method: 'POST',
    body: { content: 'Bom conteúdo' },
    headers: {
      Authorization: 'Bearer access',
      'Idempotency-Key': 'operation-1',
    },
  });

  await expect(
    gateway.edit('post-1', 'comment-1', ' Atualizado '),
  ).resolves.toMatchObject({ content: 'Atualizado' });
  expect(request).toHaveBeenNthCalledWith(3, {
    path: '/posts/post-1/comments/comment-1',
    method: 'PATCH',
    body: { content: 'Atualizado' },
    headers: { Authorization: 'Bearer access' },
  });

  await expect(gateway.delete('post-1', 'comment-1')).resolves.toBeUndefined();
  expect(request).toHaveBeenNthCalledWith(4, {
    path: '/posts/post-1/comments/comment-1',
    method: 'DELETE',
    headers: { Authorization: 'Bearer access' },
  });
});
