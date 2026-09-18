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
