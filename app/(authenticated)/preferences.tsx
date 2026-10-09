import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiPreferencesGateway } from '@/preferences/data';
import type { ThemeOption } from '@/preferences/domain';
import { PreferencesScreen } from '@/preferences/presentation';

export default function EditPreferencesRoute() {
  const router = useRouter();
  const gateway = useMemo(
    () =>
      createApiPreferencesGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const [themes, setThemes] = useState<readonly ThemeOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [available, selected] = await Promise.all([
        gateway.listThemes(),
        gateway.getSelectedThemeIds(),
      ]);
      setThemes(available);
      setSelectedIds(selected);
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [gateway]);

  useEffect(() => {
    let active = true;
    void Promise.all([gateway.listThemes(), gateway.getSelectedThemeIds()])
      .then(([available, selected]) => {
        if (!active) return;
        setThemes(available);
        setSelectedIds(selected);
        setStatus('success');
      })
      .catch((cause) => {
        if (active) {
          setLoadError(cause);
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, [gateway]);

  return (
    <PreferencesScreen
      onRetry={load}
      onSubmit={async (themeIds) => {
        await gateway.replaceThemes(themeIds);
        router.back();
      }}
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
      error={loadError}
      submitLabel="Salvar preferências"
      subtitle="Atualize os temas usados para personalizar seu conteúdo."
      themes={themes}
      title="Preferências"
    />
  );
}
