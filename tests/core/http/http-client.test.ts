import { createHttpClient } from '@/core/http/http-client';

it('serializes JSON and joins a relative path to the base URL', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ id: '1' }), { status: 201 }),
    );
  const client = createHttpClient(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    fetchImpl,
  );
  await expect(
    client.request<{ id: string }>({
      path: '/sessions',
      method: 'POST',
      body: { login: 'user' },
    }),
  ).resolves.toEqual({ id: '1' });
  expect(fetchImpl).toHaveBeenCalledWith(
    'https://api.example.test/api/v1/sessions',
    expect.objectContaining({ body: '{"login":"user"}' }),
  );
});

it('rejects absolute paths before any request', async () => {
  const fetchImpl = jest.fn();
  const client = createHttpClient(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    fetchImpl,
  );
  await expect(
    client.request({ path: 'https://other.example.test' }),
  ).rejects.toMatchObject({ category: 'bad_request' });
  expect(fetchImpl).not.toHaveBeenCalled();
});

it('accepts a successful response without JSON content', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  const client = createHttpClient(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    fetchImpl,
  );

  await expect(
    client.request<void>({ path: '/users/me/themes', method: 'PUT' }),
  ).resolves.toBeUndefined();
});

it('accepts an empty 202 response', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(new Response(null, { status: 202 }));
  const client = createHttpClient(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    fetchImpl,
  );

  await expect(
    client.request<void>({ path: '/auth/forgot-password', method: 'POST' }),
  ).resolves.toBeUndefined();
});

it('reports malformed successful JSON as a response error', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(
    new Response('{invalid', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  const client = createHttpClient(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    fetchImpl,
  );

  await expect(client.request({ path: '/workshops' })).rejects.toMatchObject({
    category: 'unknown',
    technicalMessage: 'Invalid JSON response.',
  });
});

it('maps a transport failure to a network error', async () => {
  const fetchImpl = jest.fn().mockRejectedValue(new Error('offline'));
  const client = createHttpClient(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    fetchImpl,
  );

  await expect(client.request({ path: '/feed' })).rejects.toMatchObject({
    category: 'network',
  });
});

it('aborts and maps a slow request to a timeout error', async () => {
  jest.useFakeTimers();
  try {
    const fetchImpl = jest.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new Error('aborted'));
          });
        }),
    );
    const client = createHttpClient(
      { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
      fetchImpl as typeof fetch,
      1_000,
    );
    const result = expect(
      client.request({ path: '/workshops' }),
    ).rejects.toMatchObject({ category: 'timeout' });

    await jest.advanceTimersByTimeAsync(1_000);

    await result;
    expect(fetchImpl.mock.calls[0][1]?.signal?.aborted).toBe(true);
  } finally {
    jest.useRealTimers();
  }
});
