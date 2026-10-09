import { AppError, toAppError } from './app-error';
import type { ErrorCategory } from './app-error';

export type ErrorDescription = Readonly<{
  title: string;
  message: string;
}>;

type Overrides = Partial<Record<ErrorCategory, string>>;

const descriptions: Record<ErrorCategory, ErrorDescription> = {
  network: {
    title: 'Sem conexão',
    message:
      'Não conseguimos falar com o servidor. Verifique sua internet e tente novamente.',
  },
  timeout: {
    title: 'O servidor demorou a responder',
    message: 'A conexão está lenta. Aguarde um instante e tente novamente.',
  },
  bad_request: {
    title: 'Revise os dados',
    message:
      'Alguma informação não foi aceita. Confira os campos e tente de novo.',
  },
  unauthorized: {
    title: 'Sessão expirada',
    message: 'Sua sessão expirou. Entre novamente para continuar.',
  },
  forbidden: {
    title: 'Acesso negado',
    message: 'Sua conta não tem permissão para realizar esta ação.',
  },
  not_found: {
    title: 'Conteúdo não encontrado',
    message:
      'Não encontramos este conteúdo. Ele pode ter sido removido ou alterado.',
  },
  conflict: {
    title: 'Ação indisponível agora',
    message: 'O estado deste item mudou. Atualize a tela e tente novamente.',
  },
  server: {
    title: 'Instabilidade no servidor',
    message:
      'Tivemos um problema do nosso lado. Tente novamente em alguns minutos.',
  },
  unknown: {
    title: 'Algo deu errado',
    message: 'Não foi possível concluir. Tente novamente.',
  },
};

/**
 * Translates any thrown value into a message that says what happened and what
 * the person can do next. Raw API text is never shown to the user.
 * `overrides` lets a screen give a category a message specific to its action.
 */
export function describeError(
  error: unknown,
  overrides: Overrides = {},
): ErrorDescription {
  const category =
    error instanceof AppError ? toAppError(error).category : 'unknown';
  const base = descriptions[category];
  const message = overrides[category];
  return message ? { title: base.title, message } : base;
}
