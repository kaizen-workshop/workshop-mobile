import { useEffect, useState } from 'react';

import { createTokenStorage } from '@/core/secure-storage';

const fallback = require('../../../assets/images/workshop-cover.jpg');

export function useWorkshopImageSource(imageUrl?: string) {
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    let active = true;
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

  return imageUrl && accessToken
    ? {
        uri: imageUrl,
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    : fallback;
}
