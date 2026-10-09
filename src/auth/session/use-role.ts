import { useEffect, useState } from 'react';

import {
  createTokenStorage,
  readJwtRole,
  type UserRole,
} from '@/core/secure-storage';
import { useOptionalAuth } from './auth-provider';
import type { AuthState } from './session-controller';

/** Role of the signed-in user, or null while unknown. UI gating only. */
export function useRole(): UserRole | null {
  const state = useOptionalAuth()?.state ?? null;
  const [resolved, setResolved] = useState<{
    state: AuthState;
    role: UserRole | null;
  }>();

  useEffect(() => {
    if (state !== 'AUTHENTICATED') return undefined;
    let active = true;
    createTokenStorage()
      .read()
      .then((tokens) => {
        if (active)
          setResolved({
            state,
            role: tokens ? readJwtRole(tokens.accessToken) : null,
          });
      })
      .catch(() => {
        if (active) setResolved({ state, role: null });
      });
    return () => {
      active = false;
    };
  }, [state]);

  return state === 'AUTHENTICATED' && resolved?.state === state
    ? resolved.role
    : null;
}

export function canManage(role: UserRole | null) {
  return role === 'ARWEG' || role === 'ADMIN';
}
