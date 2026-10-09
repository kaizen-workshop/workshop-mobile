import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/auth/session';
import { getEnvironment } from '@/core/config';
import { describeError } from '@/core/errors';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  createApiNotificationGateway,
  createPushDeviceStorage,
  unregisterPushDevice,
} from '@/notification/data';
import {
  registerPushDevice,
  type PushRegistrationResult,
} from '@/notification/data/push-registration';
import { SettingsScreen } from '@/settings';

const defaultPushHint = 'Receba avisos dos seus workshops neste dispositivo.';

export default function SettingsRoute() {
  const { logout } = useAuth();
  const gateway = useMemo(
    () =>
      createApiNotificationGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const pushStorage = useMemo(() => createPushDeviceStorage(), []);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushHint, setPushHint] = useState(defaultPushHint);

  useEffect(() => {
    let active = true;
    void pushStorage
      .read()
      .then((deviceId) => {
        if (active) setPushEnabled(deviceId !== null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pushStorage]);

  const togglePush = async (next: boolean) => {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      if (next) {
        const result = await registerPushDevice(gateway, pushStorage);
        setPushEnabled(result.status === 'registered');
        setPushHint(
          result.status === 'registered'
            ? 'Este dispositivo receberá avisos dos seus workshops.'
            : pushFailure(result),
        );
      } else {
        await unregisterPushDevice(gateway, pushStorage);
        setPushEnabled(false);
        setPushHint(defaultPushHint);
      }
    } catch (cause) {
      setPushHint(
        describeError(cause, {
          unknown: 'Não foi possível alterar as notificações. Tente novamente.',
        }).message,
      );
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <SettingsScreen
      onLogout={() => void logout()}
      onOpenChangePassword={() =>
        router.push('/(authenticated)/change-password')
      }
      onOpenNotifications={() =>
        router.push('/(authenticated)/(tabs)/notifications')
      }
      onOpenPreferences={() => router.push('/(authenticated)/preferences')}
      onOpenProfile={() => router.push('/(authenticated)/(tabs)/profile')}
      onTogglePush={(next) => void togglePush(next)}
      pushBusy={pushBusy}
      pushDescription={pushHint}
      pushEnabled={pushEnabled}
    />
  );
}

function pushFailure(result: PushRegistrationResult) {
  if (result.status === 'denied')
    return 'A permissão de notificações foi negada. Libere nas configurações do aparelho.';
  if (result.status === 'missing_project_id')
    return 'O projeto EAS ainda não foi vinculado.';
  if (result.status === 'error')
    return 'Não foi possível ativar o push. Tente novamente.';
  return 'O push exige um dispositivo físico Android ou iOS.';
}
