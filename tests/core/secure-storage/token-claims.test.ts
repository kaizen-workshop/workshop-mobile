import {
  readJwtSubject,
  readJwtSession,
  readSessionUserId,
} from '@/core/secure-storage/token-claims';

function jwt(payload: object) {
  const encode = (value: object) =>
    globalThis
      .btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  return `${encode({ alg: 'none' })}.${encode(payload)}.signature`;
}

it('reads the session owner from the locally stored JWT', async () => {
  const accessToken = jwt({ sub: 'user-123' });
  const storage = {
    read: jest.fn().mockResolvedValue({ accessToken, refreshToken: 'refresh' }),
    save: jest.fn(),
    clear: jest.fn(),
  };

  await expect(readSessionUserId(storage)).resolves.toBe('user-123');
});

it('reads the local expiration and mandatory-password state', () => {
  expect(
    readJwtSession(
      jwt({ sub: 'user-123', exp: 1_800_000_000, mustChangePassword: true }),
    ),
  ).toEqual({
    userId: 'user-123',
    expiresAt: 1_800_000_000_000,
    mustChangePassword: true,
  });
});

it.each(['invalid', jwt({}), jwt({ sub: 42 })])(
  'rejects an unusable local subject from %s',
  (accessToken) => {
    expect(readJwtSubject(accessToken)).toBeNull();
  },
);
