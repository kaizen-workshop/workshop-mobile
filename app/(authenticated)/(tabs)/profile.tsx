import { router } from 'expo-router';
import { adminHref } from '@/admin';
import { canManage, useRole } from '@/auth/session';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getEnvironment } from '@/core/config';
import { describeError } from '@/core/errors';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createParticipantWorkshopGateway } from '@/calendar';
import {
  createApiProfileGateway,
  ProfileScreen,
  type ProfileStats,
  type UserProfile,
} from '@/profile';

export default function ProfileRoute() {
  const role = useRole();
  const gateway = useMemo(
    () =>
      createApiProfileGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [stats, setStats] = useState<ProfileStats>();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const [profile, setProfile] = useState<UserProfile>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<boolean | string>(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setProfile(await gateway.load());
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [gateway]);

  useEffect(() => {
    let active = true;
    // Stats are a nicety: if they fail the profile still works, so no error UI.
    const workshops = createParticipantWorkshopGateway(
      createAuthenticatedHttpClient(getEnvironment()),
      createTokenStorage(),
    );
    void Promise.all([
      workshops.loadHistory('COMPLETED', 0, 50),
      workshops.loadHistory('FUTURE', 0, 50),
      workshops.loadHistory('WAITING_LIST', 0, 50),
    ])
      .then(([completed, future, waiting]) => {
        if (!active) return;
        setStats({
          completed: completed.items.length,
          active: future.items.length,
          waiting: waiting.items.length,
        });
      })
      .catch(() => undefined);
    void gateway
      .load()
      .then((value) => {
        if (!active) return;
        setProfile(value);
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
    <ProfileScreen
      key={`${profile?.id}:${profile?.name}:${profile?.phone}:${profile?.profileImage}`}
      profile={profile}
      stats={stats}
      status={status}
      error={loadError}
      saving={saving}
      saveError={saveError}
      onRetry={load}
      onOpenAdmin={
        canManage(role) ? () => router.push(adminHref.home) : undefined
      }
      onSave={async (input) => {
        if (saving) return;
        setSaving(true);
        setSaveError(false);
        try {
          setProfile(await gateway.update(input));
        } catch (cause) {
          setSaveError(
            describeError(cause, {
              bad_request:
                'Os dados do perfil não foram aceitos. Revise nome e telefone.',
            }).message,
          );
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
