import { createParticipantWorkshopGateway } from '@/calendar';

const storage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};
const workshop = {
  id: 'workshop-1',
  title: 'Kaizen',
  description: 'Melhoria contínua',
  startDate: '2026-10-10',
  endDate: '2026-10-10',
  startTime: '09:00:00',
  endTime: '11:00:00',
  location: 'WEG',
  modality: 'IN_PERSON',
};
it('uses the participant history and calendar endpoints', async () => {
  const request = jest
    .fn()
    .mockResolvedValue({ content: [workshop], number: 0, last: true });
  const gateway = createParticipantWorkshopGateway({ request }, storage);
  await expect(gateway.loadHistory()).resolves.toMatchObject({
    items: [workshop],
    hasMore: false,
  });
  expect(request).toHaveBeenNthCalledWith(1, {
    path: '/users/me/workshops/history?filter=COMPLETED&page=0&size=20',
    headers: { Authorization: 'Bearer access' },
  });
  await gateway.loadCalendar({ from: '2026-10-01', to: '2026-10-31' });
  expect(request).toHaveBeenNthCalledWith(2, {
    path: '/users/me/workshops/calendar?page=0&size=20&from=2026-10-01&to=2026-10-31',
    headers: { Authorization: 'Bearer access' },
  });
});
