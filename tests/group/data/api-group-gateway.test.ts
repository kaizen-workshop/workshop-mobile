import { createApiGroupGateway } from '@/group';
const storage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};
const group = {
  id: 'group-1',
  workshopId: 'workshop-1',
  workshopTitle: 'Kaizen',
  active: true,
  canSendMessages: true,
  canModerate: false,
  updatedAt: '2026-10-02T12:00:00Z',
};
it('lists only groups authorized by the API', async () => {
  const request = jest
    .fn()
    .mockResolvedValue({ content: [group], number: 0, last: true });
  const gateway = createApiGroupGateway({ request }, storage);
  await expect(gateway.loadPage()).resolves.toEqual({
    items: [group],
    page: 0,
    hasMore: false,
  });
});
