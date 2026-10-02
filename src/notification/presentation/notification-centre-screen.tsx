import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { NotificationItem } from '@/notification/domain';
import { EmptyState, ErrorState, LoadingState } from '@/shared/presentation';
import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  items: readonly NotificationItem[];
  loadingMore?: boolean;
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
    <>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {!item.read ? (
          <Text accessibilityLabel="Não lida" style={styles.dot}>
            ●
          </Text>
        ) : null}
      </View>
      <Text style={styles.message}>{item.message}</Text>
    </>
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
      style={[styles.card, !item.read && styles.unread]}
    >
      {content}
    </Pressable>
  );
}

export function NotificationCentreScreen({
  status,
  items,
  loadingMore = false,
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
        title="Nenhuma notificação"
        message="As novidades dos seus workshops aparecerão aqui."
      />
    );

  return (
    <FlatList
      testID="notification-list"
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <Text accessibilityRole="header" style={styles.title}>
          Notificações
        </Text>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            accessibilityLabel="Carregando mais notificações"
            accessibilityRole="progressbar"
            color={colors.brand}
          />
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

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  unread: { borderColor: colors.brand, borderLeftWidth: 4 },
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
});
