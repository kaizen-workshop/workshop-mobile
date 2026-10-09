export type ErrorCategory =
  | 'network'
  | 'timeout'
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'server'
  | 'unknown';
export type FieldError = Readonly<{ field: string; message: string }>;

type AppErrorInput = Readonly<{
  category: ErrorCategory;
  status?: number;
  code?: string;
  technicalMessage?: string;
  fieldErrors?: readonly FieldError[];
}>;

export class AppError extends Error {
  readonly category: ErrorCategory;
  readonly status?: number;
  readonly code?: string;
  readonly technicalMessage?: string;
  /** Per-field validation messages the API returned (HTTP 400). */
  readonly fieldErrors: readonly FieldError[];
  readonly userMessage =
    'Não foi possível concluir esta ação. Tente novamente.';

  constructor(input: AppErrorInput) {
    super(input.technicalMessage);
    this.category = input.category;
    this.status = input.status;
    this.code = input.code;
    this.technicalMessage = input.technicalMessage;
    this.fieldErrors = input.fieldErrors ?? [];
  }
}

export function toAppError(error: unknown): AppError {
  if (!(error instanceof AppError))
    return new AppError({
      category: 'unknown',
      technicalMessage: error instanceof Error ? error.message : undefined,
    });
  const categories: Record<number, ErrorCategory> = {
    400: 'bad_request',
    401: 'unauthorized',
    403: 'forbidden',
    404: 'not_found',
    409: 'conflict',
  };
  return new AppError({
    ...error,
    category:
      error.status && error.status >= 500
        ? 'server'
        : (categories[error.status ?? 0] ?? error.category),
  });
}
