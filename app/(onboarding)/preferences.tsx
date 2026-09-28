import { useState } from 'react';

import { PreferencesScreen } from '@/preferences/presentation';

export default function OnboardingPreferencesRoute() {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  return (
    <PreferencesScreen
      onSubmit={async () => {
        throw new Error('Preferences integration unavailable');
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
      status="error"
      themes={[]}
    />
  );
}
