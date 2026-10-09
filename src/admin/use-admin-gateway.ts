import { useMemo } from 'react';

import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiAdminGateway } from './api-admin-gateway';

export function useAdminGateway() {
  return useMemo(
    () =>
      createApiAdminGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
}
