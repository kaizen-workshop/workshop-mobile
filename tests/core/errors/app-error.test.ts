import { AppError, toAppError } from '@/core/errors/app-error';

it.each([
  [400, 'bad_request'],
  [401, 'unauthorized'],
  [403, 'forbidden'],
  [404, 'not_found'],
  [409, 'conflict'],
  [500, 'server'],
])('maps status %i to %s', (status, category) => {
  expect(
    toAppError(new AppError({ category: 'unknown', status })),
  ).toMatchObject({ category, status });
});

it('keeps the business code without exposing the technical message to the user', () => {
  const error = toAppError(
    new AppError({
      category: 'unknown',
      status: 400,
      code: 'WORKSHOP_FULL',
      technicalMessage: 'Full',
    }),
  );
  expect(error.code).toBe('WORKSHOP_FULL');
  expect(error.userMessage).not.toContain('Full');
});
