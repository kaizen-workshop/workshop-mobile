import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

type RetryProps = Readonly<{
  onRetry?: () => void;
  retryLabel?: string;
}>;

function StateLayout({
  children,
  title,
}: Readonly<{ children?: ReactNode; title: string }>) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {children}
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
      style={styles.button}
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
      <ActivityIndicator color={colors.brand} size="large" />
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
    <View accessibilityRole="alert">
      <StateLayout title={title}>
        <Text style={styles.message}>{message}</Text>
        <RetryButton onRetry={onRetry} retryLabel={retryLabel} />
      </StateLayout>
    </View>
  );
}

export function EmptyState({
  message,
  title = 'Nenhum conteúdo por aqui',
}: Readonly<{ message?: string; title?: string }>) {
  return (
    <StateLayout title={title}>
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
    <View accessibilityRole="alert">
      <StateLayout title="Sem conexão">
        <Text style={[styles.message, styles.offline]}>{message}</Text>
        <RetryButton onRetry={onRetry} retryLabel={retryLabel} />
      </StateLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: 20,
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
  offline: {
    color: colors.textMuted,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
});
