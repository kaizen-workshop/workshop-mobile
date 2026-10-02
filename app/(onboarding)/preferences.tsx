import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/auth/session';
import { getEnvironment } from '@/core/config';
import { createHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiPreferencesGateway } from '@/preferences/data';
import type { ThemeOption } from '@/preferences/domain';
import { PreferencesScreen } from '@/preferences/presentation';

export default function OnboardingPreferencesRoute() {
  const { completeOnboarding } = useAuth();
  const gateway = useMemo(
    () =>
      createApiPreferencesGateway(
        createHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [themes, setThemes] = useState<readonly ThemeOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const loadThemes = useCallback(async () => {
    setStatus('loading');
    try {
      setThemes(await gateway.listThemes());
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [gateway]);

  useEffect(() => {
    let active = true;
    void gateway
      .listThemes()
      .then((loadedThemes) => {
        if (!active) return;
        setThemes(loadedThemes);
        setStatus('success');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [gateway]);

  return (
    <PreferencesScreen
      onSubmit={async (themeIds) => {
        await gateway.replaceThemes(themeIds);
        completeOnboarding();
      }}
      onRetry={loadThemes}
      onToggle={(themeId) => {
        setSelectedIds((current) => {
          const next = new Set(current);
          if (next.has(themeId)) next.delete(themeId);
          else next.add(themeId);
          return next;
        });
      }}
      selectedIds={selectedIds}
      status={status}
      themes={themes}
    />
  );
}
