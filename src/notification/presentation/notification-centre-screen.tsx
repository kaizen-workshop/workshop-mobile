import {
  AlertCircle,
  Bell,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  type LucideIcon,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import type { NotificationItem } from '@/notification/domain';
import {
  notificationDayLabel,
  notificationTimeLabel,
  showsDayHeading,
} from './notification-time';
import { BackHeader, StatePage } from '@/navigation';
import { EmptyState, ErrorState, LoadingState } from '@/shared/presentation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

const typeIcons: Record<string, LucideIcon> = {
  REGISTRATION_CREATED: Check,
  WAITING_LIST_JOINED: Clock,
  WAITING_LIST_PROMOTED: Check,
  PAYMENT_CONFIRMED: CreditCard,
  PAYMENT_DECLINED: AlertCircle,
  MANUAL: CalendarDays,
};

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  items: readonly NotificationItem[];
  loadingMore?: boolean;
  loadMoreError?: boolean;
  onRetry(): void;
  onLoadMore?: () => void;
  onPress?: (item: NotificationItem) => void;
  onMarkAllRead?: () => void;
}>;

function NotificationCard({
  item,
  onPress,
}: Readonly<{
  item: NotificationItem;
  onPress?: () => void;
}>) {
  const Icon = typeIcons[item.type] ?? Bell;
  const content = (
    <View style={styles.cardContent}>
      <View style={[styles.icon, !item.read && styles.iconUnread]}>
        <Icon color={!item.read ? colors.brand : colors.textMuted} size={20} />
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
        <Text style={styles.date}>{notificationTimeLabel(item.createdAt)}</Text>
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
  error,
  items,
  loadingMore = false,
  loadMoreError = false,
  onRetry,
  onLoadMore,
  onMarkAllRead,
  onPress,
}: Props) {
  const unread = items.filter((item) => !item.read).length;
  const header = (
    <View>
      <BackHeader
        fallback="/(authenticated)/(tabs)/feed"
        title="Notificações"
      />
      <View style={styles.summary}>
        <View style={styles.unreadChip}>
          <Text style={styles.unreadChipText}>
            {unread === 0
              ? 'Tudo lido'
              : `${unread} ${unread === 1 ? 'não lida' : 'não lidas'}`}
          </Text>
        </View>
        {unread > 0 && onMarkAllRead ? (
          <Pressable
            accessibilityRole="button"
            onPress={onMarkAllRead}
            style={({ pressed }) => [styles.markAll, pressed && styles.pressed]}
          >
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (items.length === 0)
    return (
      <StatePage
        fallback="/(authenticated)/(tabs)/feed"
        kind="back"
        title="Notificações"
      >
        {status === 'loading' ? (
          <LoadingState message="Carregando notificações" />
        ) : status === 'error' ? (
          <ErrorState
            message="Não foi possível carregar as notificações."
            error={error}
            onRetry={onRetry}
          />
        ) : (
          <EmptyState
            actionLabel="Atualizar avisos"
            title="Nenhuma notificação"
            message="As novidades dos seus workshops aparecerão aqui."
            onAction={onRetry}
          />
        )}
      </StatePage>
    );

  const footer = loadingMore ? (
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
  ) : null;

  return (
    <FlatList
      testID="notification-list"
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={header}
      ListFooterComponent={
        <View>
          {footer}
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/(authenticated)/settings')}
            style={({ pressed }) => [styles.manage, pressed && styles.pressed]}
          >
            <Text style={styles.manageText}>Gerenciar notificações</Text>
          </Pressable>
        </View>
      }
      onEndReached={loadingMore ? undefined : onLoadMore}
      onEndReachedThreshold={0.4}
      renderItem={({ item, index }) => (
        <View>
          {showsDayHeading(items, index) ? (
            <Text accessibilityRole="header" style={styles.dayHeading}>
              {notificationDayLabel(item.createdAt)}
            </Text>
          ) : null}
          <NotificationCard
            item={item}
            onPress={onPress ? () => onPress(item) : undefined}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  unreadChip: {
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  unreadChipText: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
  },
  markAll: { minHeight: sizes.touchTarget, justifyContent: 'center' },
  markAllText: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  dayHeading: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  manage: {
    alignItems: 'center',
    marginTop: spacing.lg,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
  },
  manageText: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
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
