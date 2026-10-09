import { AppError } from '@/core/errors';

import type { TokenStorage } from './token-storage';

type JwtPayload = Readonly<{
  sub?: unknown;
  exp?: unknown;
  role?: unknown;
  mustChangePassword?: unknown;
  requiresOnboarding?: unknown;
}>;

export type LocalJwtSession = Readonly<{
  userId: string;
  expiresAt: number;
  mustChangePassword: boolean;
  requiresOnboarding: boolean;
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

export type UserRole = 'PARTICIPANT' | 'ARWEG' | 'ADMIN';

/** Reads the role claim for UI gating only; the API enforces every permission. */
export function readJwtRole(accessToken: string): UserRole | null {
  const role = readJwtPayload(accessToken)?.role;
  return role === 'PARTICIPANT' || role === 'ARWEG' || role === 'ADMIN'
    ? role
    : null;
}

export function readJwtSession(accessToken: string): LocalJwtSession | null {
  const payload = readJwtPayload(accessToken);
  if (
    typeof payload?.sub !== 'string' ||
    !payload.sub.trim() ||
    typeof payload.exp !== 'number' ||
    !Number.isFinite(payload.exp) ||
    typeof payload.mustChangePassword !== 'boolean' ||
    typeof payload.requiresOnboarding !== 'boolean'
  ) {
    return null;
  }
  return {
    userId: payload.sub,
    expiresAt: payload.exp * 1_000,
    mustChangePassword: payload.mustChangePassword,
    requiresOnboarding: payload.requiresOnboarding,
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
