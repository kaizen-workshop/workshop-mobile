import type { EnvironmentConfig } from '@/core/config';
import { AppError, toAppError } from '@/core/errors';

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
          });
        }
        return (await response.json()) as T;
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
