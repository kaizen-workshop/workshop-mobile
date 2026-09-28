import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { FeedCard } from '@/feed/domain';
import { EmptyState, ErrorState, LoadingState } from '@/shared/presentation';
import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  items: readonly FeedCard[];
  refreshing?: boolean;
  loadingMore?: boolean;
  onRefresh(): void;
  onRetry?: () => void;
  onLoadMore?: () => void;
  onItemPress?: (item: FeedCard) => void;
}>;

function FeedItem({
  item,
  onPress,
}: Readonly<{ item: FeedCard; onPress?: () => void }>) {
  const content = (
    <>
      <View style={styles.cardHeader}>
        <Text style={styles.kind}>
          {item.kind === 'workshop' ? 'Workshop' : 'Post'}
        </Text>
        {item.highlighted ? (
          <Text accessibilityLabel="Destaque" style={styles.highlight}>
            Destaque
          </Text>
        ) : null}
      </View>
      <Text accessibilityRole="header" style={styles.cardTitle}>
        {item.title}
      </Text>
      {item.summary ? (
        <Text numberOfLines={3} style={styles.summary}>
          {item.summary}
        </Text>
      ) : null}
      {item.context ? <Text style={styles.context}>{item.context}</Text> : null}
    </>
  );

  if (!onPress) return <View style={styles.card}>{content}</View>;
  return (
    <Pressable
      accessibilityLabel={`Abrir ${item.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.card}
    >
      {content}
    </Pressable>
  );
}

export function FeedScreen({
  items,
  loadingMore = false,
  onItemPress,
  onLoadMore,
  onRefresh,
  onRetry,
  refreshing = false,
  status,
}: Props) {
  if (status === 'loading' && items.length === 0)
    return <LoadingState message="Carregando feed" />;
  if (status === 'error' && items.length === 0)
    return (
      <ErrorState
        message="Não foi possível carregar o feed."
        onRetry={onRetry}
      />
    );
  if (items.length === 0)
    return (
      <EmptyState
        message="Novos workshops e publicações aparecerão aqui."
        title="Seu feed está vazio"
      />
    );

  return (
    <FlatList
      testID="feed-list"
      contentContainerStyle={styles.list}
      data={[...items]}
      keyExtractor={(item) => `${item.kind}:${item.id}`}
      ListHeaderComponent={
        <Text accessibilityRole="header" style={styles.title}>
          Feed
        </Text>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            accessibilityLabel="Carregando mais itens"
            color={colors.brand}
            style={styles.loadingMore}
          />
        ) : null
      }
      onEndReached={loadingMore ? undefined : onLoadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          colors={[colors.brand]}
          onRefresh={onRefresh}
          refreshing={refreshing}
          tintColor={colors.brand}
        />
      }
      renderItem={({ item }) => (
        <FeedItem
          item={item}
          onPress={onItemPress ? () => onItemPress(item) : undefined}
        />
      )}
      style={styles.page}
    />
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
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
    marginBottom: spacing.md,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  kind: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.label,
    fontWeight: typography.bold,
  },
  highlight: {
    backgroundColor: colors.brand,
    borderRadius: radii.full,
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: 12,
    fontWeight: typography.bold,
    overflow: 'hidden',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: 20,
    fontWeight: typography.bold,
  },
  summary: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  context: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.label,
    marginTop: spacing.sm,
  },
  loadingMore: {
    marginVertical: spacing.md,
  },
});
