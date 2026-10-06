import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/auth/session';
import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import { createApiNotificationGateway } from '@/notification/data';
import { BackHeader } from '@/navigation';
import {
  registerPushDevice,
  type PushRegistrationResult,
} from '@/notification/data/push-registration';
import { AppSymbol } from '@/shared/presentation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

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
  const [pushResult, setPushResult] = useState<PushRegistrationResult>();
  const [registeringPush, setRegisteringPush] = useState(false);
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.content}>
        <BackHeader eyebrow="Sua conta" title="Configurações" />

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Experiência
          </Text>
          <Setting
            icon={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
            title="Preferências"
            description="Escolha os temas usados para personalizar o conteúdo."
            onPress={() => router.push('/(authenticated)/preferences')}
          />
          <Setting
            icon={{
              ios: 'bell.fill',
              android: 'notifications',
              web: 'notifications',
            }}
            title="Notificações e comunicação"
            description="Consulte os avisos e comunicações recebidos."
            onPress={() => router.push('/(authenticated)/(tabs)/notifications')}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              busy: registeringPush,
              disabled: registeringPush,
            }}
            disabled={registeringPush}
            onPress={async () => {
              setRegisteringPush(true);
              try {
                setPushResult(await registerPushDevice(gateway));
              } finally {
                setRegisteringPush(false);
              }
            }}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
              registeringPush && styles.cardDisabled,
            ]}
          >
            <View style={styles.iconContainer}>
              {registeringPush ? (
                <ActivityIndicator color={colors.brand} />
              ) : (
                <AppSymbol
                  color={colors.brand}
                  fallback="●"
                  name={{
                    ios: 'bell.badge.fill',
                    android: 'notifications_active',
                    web: 'notifications_active',
                  }}
                />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Ativar notificações push</Text>
              <Text style={styles.description}>
                {pushMessage(pushResult, registeringPush)}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Aplicativo e segurança
          </Text>
          <Setting
            icon={{
              ios: 'circle.lefthalf.filled',
              android: 'contrast',
              web: 'contrast',
            }}
            title="Tema do aplicativo"
            description="A versão atual usa o tema claro para manter contraste consistente."
          />
          <Setting
            icon={{
              ios: 'lock.shield.fill',
              android: 'security',
              web: 'security',
            }}
            title="Privacidade"
            description="Seus tokens ficam protegidos no dispositivo e sua senha nunca é salva."
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void logout()}
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.logoutPressed,
          ]}
        >
          <AppSymbol
            color={colors.danger}
            fallback="↪"
            name={{
              ios: 'rectangle.portrait.and.arrow.right',
              android: 'logout',
              web: 'logout',
            }}
          />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function pushMessage(
  result: PushRegistrationResult | undefined,
  loading: boolean,
) {
  if (loading) return 'Registrando este dispositivo...';
  if (!result) return 'Permita notificações e registre este dispositivo.';
  if (result.status === 'registered') return 'Dispositivo registrado.';
  if (result.status === 'denied')
    return 'A permissão de notificações foi negada.';
  if (result.status === 'missing_project_id')
    return 'O projeto EAS ainda não foi vinculado.';
  return 'O push exige um dispositivo físico Android ou iOS.';
}

function Setting({
  title,
  description,
  onPress,
  icon,
}: {
  title: string;
  description: string;
  onPress?: () => void;
  icon: Parameters<typeof AppSymbol>[0]['name'];
}) {
  const content = (
    <>
      <View style={styles.iconContainer}>
        <AppSymbol color={colors.brand} fallback="•" name={icon} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {onPress ? (
        <AppSymbol
          color={colors.textMuted}
          fallback="›"
          name={{
            ios: 'chevron.right',
            android: 'chevron_right',
            web: 'chevron_right',
          }}
          size={18}
        />
      ) : null}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.card}>{content}</View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.lg,
  },
  content: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    width: '100%',
  },
  section: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
    ...shadows.card,
  },
  cardPressed: {
    backgroundColor: colors.brandSubtle,
    borderColor: colors.brandSoft,
    transform: [{ scale: 0.995 }],
  },
  cardDisabled: {
    opacity: 0.7,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    marginTop: spacing.xxs,
  },
  logout: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  logoutPressed: {
    backgroundColor: colors.dangerSoft,
  },
  logoutText: {
    color: colors.danger,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
});
