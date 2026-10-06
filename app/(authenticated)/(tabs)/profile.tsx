import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  createApiProfileGateway,
  ProfileScreen,
  type UserProfile,
} from '@/profile';

export default function ProfileRoute() {
  const gateway = useMemo(
    () =>
      createApiProfileGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [profile, setProfile] = useState<UserProfile>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setProfile(await gateway.load());
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [gateway]);

  useEffect(() => {
    let active = true;
    void gateway
      .load()
      .then((value) => {
        if (!active) return;
        setProfile(value);
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
    <ProfileScreen
      key={`${profile?.id}:${profile?.name}:${profile?.phone}:${profile?.profileImage}`}
      profile={profile}
      status={status}
      saving={saving}
      saveError={saveError}
      onRetry={load}
      onSave={async (input) => {
        if (saving) return;
        setSaving(true);
        setSaveError(false);
        try {
          setProfile(await gateway.update(input));
        } catch {
          setSaveError(true);
        } finally {
          setSaving(false);
        }
      }}
      onOpenPreferences={() => router.push('/(authenticated)/preferences')}
      onOpenHistory={() => router.push('/(authenticated)/history')}
      onOpenCalendar={() => router.push('/(authenticated)/calendar')}
      onOpenGroups={() => router.push('/(authenticated)/groups')}
      onOpenSettings={() => router.push('/(authenticated)/settings')}
    />
  );
}
