import type { EnvironmentConfig } from '@/core/config';
import { AppError, toAppError, type FieldError } from '@/core/errors';

export type HttpRequest = Readonly<{
  path: string;
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
}>;
export type HttpClient = Readonly<{
  request<T>(request: HttpRequest): Promise<T>;
}>;

export function createHttpClient(
  config: EnvironmentConfig,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 15_000,
): HttpClient {
  return {
    async request<T>({
      path,
      method = 'GET',
      headers,
      body,
    }: HttpRequest): Promise<T> {
      if (!path.startsWith('/') || /^https?:\/\//i.test(path))
        throw new AppError({
          category: 'bad_request',
          technicalMessage: 'Path must be relative.',
        });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(`${config.apiUrl}${path}`, {
          method,
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            ...(body === undefined
              ? {}
              : { 'Content-Type': 'application/json' }),
            ...headers,
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (!response.ok) {
          const payload: unknown = await response.json().catch(() => undefined);
          const code =
            payload &&
            typeof payload === 'object' &&
            'code' in payload &&
            typeof payload.code === 'string'
              ? payload.code
              : undefined;
          throw new AppError({
            category: 'unknown',
            status: response.status,
            code,
            fieldErrors: readFieldErrors(payload),
          });
        }
        if (response.status === 204 || response.status === 205)
          return undefined as T;
        const contentLength = response.headers.get('content-length');
        if (contentLength === '0') return undefined as T;
        const text = await response.text();
        if (!text) return undefined as T;
        try {
          return JSON.parse(text) as T;
        } catch {
          throw new AppError({
            category: 'unknown',
            status: response.status,
            technicalMessage: 'Invalid JSON response.',
          });
        }
      } catch (error) {
        if (controller.signal.aborted)
          throw new AppError({ category: 'timeout' });
        if (error instanceof AppError) throw toAppError(error);
        throw new AppError({
          category: 'network',
          technicalMessage: error instanceof Error ? error.message : undefined,
        });
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function readFieldErrors(payload: unknown): FieldError[] {
  if (!payload || typeof payload !== 'object' || !('errors' in payload))
    return [];
  const errors = (payload as { errors: unknown }).errors;
  if (!Array.isArray(errors)) return [];
  return errors.flatMap((item) =>
    item &&
    typeof item === 'object' &&
    typeof (item as FieldError).field === 'string' &&
    typeof (item as FieldError).message === 'string'
      ? [
          {
            field: (item as FieldError).field,
            message: (item as FieldError).message,
          },
        ]
      : [],
  );
}
