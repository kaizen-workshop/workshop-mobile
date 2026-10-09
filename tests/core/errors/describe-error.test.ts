import { AppError, describeError } from '@/core/errors';

it.each([
  ['network', 'Sem conexão'],
  ['timeout', 'O servidor demorou a responder'],
  ['unauthorized', 'Sessão expirada'],
  ['forbidden', 'Acesso negado'],
  ['not_found', 'Conteúdo não encontrado'],
  ['conflict', 'Ação indisponível agora'],
  ['bad_request', 'Revise os dados'],
  ['server', 'Instabilidade no servidor'],
] as const)('describes %s errors distinctly', (category, title) => {
  expect(describeError(new AppError({ category })).title).toBe(title);
});

it('maps HTTP status to a category and ignores raw API text', () => {
  const description = describeError(
    new AppError({
      category: 'unknown',
      status: 503,
      technicalMessage: 'java.lang.NullPointerException at X',
    }),
  );
  expect(description.title).toBe('Instabilidade no servidor');
  expect(description.message).not.toMatch(/NullPointer/);
});

it('falls back for non-AppError values and honours overrides', () => {
  expect(describeError(new Error('boom')).title).toBe('Algo deu errado');
  expect(
    describeError(new AppError({ category: 'unauthorized' }), {
      unauthorized: 'Usuário/e-mail ou senha inválidos.',
    }).message,
  ).toBe('Usuário/e-mail ou senha inválidos.');
});
