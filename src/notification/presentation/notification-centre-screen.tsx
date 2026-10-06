import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { NotificationItem } from '@/notification/domain';
import { AppHeader } from '@/navigation';
import {
  AppSymbol,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/presentation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

const notificationSymbol = {
  ios: 'bell.fill',
  android: 'notifications',
  web: 'notifications',
} as const;

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  items: readonly NotificationItem[];
  loadingMore?: boolean;
  loadMoreError?: boolean;
  onRetry(): void;
  onLoadMore?: () => void;
  onPress?: (item: NotificationItem) => void;
}>;

function NotificationCard({
  item,
  onPress,
}: Readonly<{
  item: NotificationItem;
  onPress?: () => void;
}>) {
  const content = (
    <View style={styles.cardContent}>
      <View style={[styles.icon, !item.read && styles.iconUnread]}>
        <AppSymbol
          color={!item.read ? colors.brand : colors.textMuted}
          fallback="•"
          name={notificationSymbol}
          size={20}
        />
      </View>
      <View style={styles.cardText}>
        <View style={styles.header}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {!item.read ? (
            <Text accessibilityLabel="Não lida" style={styles.dot}>
              ●
            </Text>
          ) : null}
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  if (!onPress)
    return (
      <View style={[styles.card, !item.read && styles.unread]}>{content}</View>
    );
  return (
    <Pressable
      accessibilityLabel={`${item.read ? '' : 'Não lida. '}${item.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !item.read && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

export function NotificationCentreScreen({
  status,
  items,
  loadingMore = false,
  loadMoreError = false,
  onRetry,
  onLoadMore,
  onPress,
}: Props) {
  if (status === 'loading' && items.length === 0)
    return <LoadingState message="Carregando notificações" />;
  if (status === 'error' && items.length === 0)
    return (
      <ErrorState
        message="Não foi possível carregar as notificações."
        onRetry={onRetry}
      />
    );
  if (items.length === 0)
    return (
      <EmptyState
        actionLabel="Atualizar avisos"
        title="Nenhuma notificação"
        message="As novidades dos seus workshops aparecerão aqui."
        onAction={onRetry}
      />
    );

  return (
    <FlatList
      testID="notification-list"
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <AppHeader eyebrow="Central de avisos" title="Notificações" />
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            accessibilityLabel="Carregando mais notificações"
            accessibilityRole="progressbar"
            color={colors.brand}
          />
        ) : loadMoreError && onLoadMore ? (
          <Pressable
            accessibilityRole="button"
            onPress={onLoadMore}
            style={({ pressed }) => [
              styles.paginationRetry,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.paginationRetryText}>
              Não foi possível carregar mais. Tentar novamente
            </Text>
          </Pressable>
        ) : null
      }
      onEndReached={loadingMore ? undefined : onLoadMore}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <NotificationCard
          item={item}
          onPress={onPress ? () => onPress(item) : undefined}
        />
      )}
    />
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.surface3,
    borderRadius: radii.xxl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  unread: { borderColor: colors.brandSoft },
  pressed: { opacity: 0.68 },
  cardContent: { flexDirection: 'row' },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: radii.full,
    height: 42,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 42,
  },
  iconUnread: { backgroundColor: colors.brandSubtle },
  cardText: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  dot: { color: colors.brand, marginLeft: spacing.sm },
  message: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  date: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  paginationRetry: {
    alignItems: 'center',
    minHeight: sizes.touchTarget,
    padding: spacing.sm,
  },
  paginationRetryText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
});
