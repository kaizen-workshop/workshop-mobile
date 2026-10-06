import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';
import { AppSymbol } from './app-symbol';

type RetryProps = Readonly<{
  onRetry?: () => void;
  retryLabel?: string;
}>;

const stateSymbols = {
  error: {
    ios: 'exclamationmark.triangle.fill',
    android: 'error',
    web: 'error',
  },
  inbox: { ios: 'tray.fill', android: 'inbox', web: 'inbox' },
  offline: { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' },
} as const;

function StateLayout({
  children,
  icon,
  title,
}: Readonly<{
  children?: ReactNode;
  icon: keyof typeof stateSymbols;
  title: string;
}>) {
  return (
    <View style={styles.container}>
      <View style={styles.stateCard}>
        <View style={styles.iconCircle}>
          <AppSymbol
            color={colors.brand}
            fallback="•"
            name={stateSymbols[icon]}
            size={28}
          />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {children}
      </View>
    </View>
  );
}

function RetryButton({ onRetry, retryLabel = 'Tentar novamente' }: RetryProps) {
  if (!onRetry) return null;

  return (
    <Pressable
      accessibilityLabel={retryLabel}
      accessibilityRole="button"
      onPress={onRetry}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Text style={styles.buttonText}>{retryLabel}</Text>
    </Pressable>
  );
}

export function LoadingState({
  message = 'Carregando...',
}: {
  message?: string;
}) {
  return (
    <View
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={styles.container}
    >
      <View style={styles.loadingIndicator}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function ErrorState({
  message = 'Não foi possível carregar o conteúdo.',
  onRetry,
  retryLabel,
  title = 'Algo deu errado',
}: RetryProps & Readonly<{ message?: string; title?: string }>) {
  return (
    <View accessibilityRole="alert" style={styles.alertWrapper}>
      <StateLayout icon="error" title={title}>
        <Text style={styles.message}>{message}</Text>
        <RetryButton onRetry={onRetry} retryLabel={retryLabel} />
      </StateLayout>
    </View>
  );
}

export function EmptyState({
  actionLabel,
  message,
  onAction,
  title = 'Nenhum conteúdo por aqui',
}: Readonly<{
  actionLabel?: string;
  message?: string;
  onAction?: () => void;
  title?: string;
}>) {
  return (
    <StateLayout icon="inbox" title={title}>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <RetryButton onRetry={onAction} retryLabel={actionLabel} />
    </StateLayout>
  );
}

export function OfflineState({
  hasCachedContent = false,
  onRetry,
  retryLabel,
}: RetryProps & Readonly<{ hasCachedContent?: boolean }>) {
  const message = hasCachedContent
    ? 'Você está offline. Exibindo os dados salvos neste dispositivo.'
    : 'Você está offline e ainda não há dados salvos para exibir.';

  return (
    <View accessibilityRole="alert" style={styles.alertWrapper}>
      <StateLayout icon="offline" title="Sem conexão">
        <Text style={styles.message}>{message}</Text>
        <RetryButton onRetry={onRetry} retryLabel={retryLabel} />
      </StateLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  alertWrapper: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  stateCard: {
    alignItems: 'center',
    maxWidth: sizes.contentMaxWidth,
    paddingVertical: spacing.xl,
    width: '100%',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 64,
  },
  loadingIndicator: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  buttonPressed: {
    backgroundColor: colors.brandPressed,
  },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
});
