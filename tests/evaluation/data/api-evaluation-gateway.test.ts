import { createApiEvaluationGateway } from '@/evaluation';
const storage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};
it('submits the four ratings and optional comment to the workshop endpoint', async () => {
  const input = {
    rating: 5,
    contentRating: 4,
    instructorRating: 5,
    organizationRating: 4,
    comment: 'Ótimo',
  };
  const response = { id: 'evaluation-1', workshopId: 'workshop-1', ...input };
  const request = jest.fn().mockResolvedValue(response);
  const gateway = createApiEvaluationGateway({ request }, storage);
  await expect(
    gateway.create('workshop-1', input, 'operation-1'),
  ).resolves.toEqual(response);
  expect(request).toHaveBeenCalledWith({
    path: '/workshops/workshop-1/evaluations',
    method: 'POST',
    body: input,
    headers: {
      Authorization: 'Bearer access',
      'Idempotency-Key': 'operation-1',
    },
  });
});
