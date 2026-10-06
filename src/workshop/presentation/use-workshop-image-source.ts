import { useCallback, useEffect, useRef, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { refreshStoredSession } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';

const fallback = require('../../../assets/images/workshop-cover.jpg');

export function useWorkshopImageSource(imageUrl?: string) {
  const [accessToken, setAccessToken] = useState<string>();
  const refreshAttempted = useRef(false);

  useEffect(() => {
    let active = true;
    refreshAttempted.current = false;
    if (!imageUrl) return undefined;
    void createTokenStorage()
      .read()
      .then((tokens) => {
        if (active) setAccessToken(tokens?.accessToken);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [imageUrl]);

  const refreshImage = useCallback(() => {
    if (!imageUrl || refreshAttempted.current) return;
    refreshAttempted.current = true;
    const storage = createTokenStorage();
    void refreshStoredSession(getEnvironment(), storage)
      .then((tokens) => setAccessToken(tokens.accessToken))
      .catch(() => undefined);
  }, [imageUrl]);

  return {
    source:
      imageUrl && accessToken
        ? {
            uri: imageUrl,
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        : fallback,
    refreshImage,
  };
}
