import { AppError } from '@/core/errors';

import type { TokenStorage } from './token-storage';

type JwtPayload = Readonly<{
  sub?: unknown;
  exp?: unknown;
  mustChangePassword?: unknown;
}>;

export type LocalJwtSession = Readonly<{
  userId: string;
  expiresAt: number;
  mustChangePassword: boolean;
}>;

export async function readSessionUserId(tokenStorage: TokenStorage) {
  const tokens = await tokenStorage.read();
  if (!tokens) throw new AppError({ category: 'unauthorized' });
  return readJwtSubject(tokens.accessToken);
}

export function readJwtSubject(accessToken: string): string | null {
  const payload = readJwtPayload(accessToken);
  return typeof payload?.sub === 'string' && payload.sub.trim()
    ? payload.sub
    : null;
}

export function readJwtSession(accessToken: string): LocalJwtSession | null {
  const payload = readJwtPayload(accessToken);
  if (
    typeof payload?.sub !== 'string' ||
    !payload.sub.trim() ||
    typeof payload.exp !== 'number' ||
    !Number.isFinite(payload.exp) ||
    typeof payload.mustChangePassword !== 'boolean'
  ) {
    return null;
  }
  return {
    userId: payload.sub,
    expiresAt: payload.exp * 1_000,
    mustChangePassword: payload.mustChangePassword,
  };
}

function readJwtPayload(accessToken: string): JwtPayload | null {
  const encodedPayload = accessToken.split('.')[1];
  if (!encodedPayload) return null;
  try {
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(globalThis.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}
