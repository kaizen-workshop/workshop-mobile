import { MessageCircle, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import type { FeedCard } from '@/feed/domain';
import { AppHeader, StatePage } from '@/navigation';
import {
  AppSymbol,
  EmptyState,
  ErrorState,
  InlineNotice,
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

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  items: readonly FeedCard[];
  refreshing?: boolean;
  loadingMore?: boolean;
  loadMoreError?: boolean;
  source?: 'network' | 'cache';
  onRefresh(): void;
  onRetry?: () => void;
  onLoadMore?: () => void;
  onItemPress?: (item: FeedCard) => void;
  onToggleLike?: (item: FeedCard) => void;
}>;

type KindFilter = 'all' | 'workshop' | 'post';

const kindFilters: readonly { value: KindFilter; label: string }[] = [
  { value: 'all', label: 'Para você' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'post', label: 'Publicações' },
];

const symbols = {
  article: { ios: 'doc.text.fill', android: 'article', web: 'article' },
  favorite: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  favoriteBorder: {
    ios: 'heart',
    android: 'favorite_border',
    web: 'favorite_border',
  },
  next: {
    ios: 'chevron.right',
    android: 'chevron_right',
    web: 'chevron_right',
  },
  workshop: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
} as const;

function FeedItem({
  item,
  onPress,
  onToggleLike,
}: Readonly<{
  item: FeedCard;
  onPress?: () => void;
  onToggleLike?: () => void;
}>) {
  const body = (
    <>
      {item.imageUrl ? (
        <Image
          accessibilityLabel={`Imagem de ${item.title}`}
          contentFit="cover"
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          transition={180}
        />
      ) : null}
      <View style={styles.cardHeader}>
        <View style={styles.kindBadge}>
          <AppSymbol
            color={colors.brand}
            fallback={item.kind === 'workshop' ? 'W' : 'P'}
            name={item.kind === 'workshop' ? symbols.workshop : symbols.article}
            size={16}
          />
          <Text style={styles.kind}>
            {item.kind === 'workshop' ? 'Workshop' : 'Publicação'}
          </Text>
        </View>
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
      {item.context ? (
        <Text style={styles.context}>{friendlyContext(item.context)}</Text>
      ) : null}
    </>
  );

  return (
    <View style={styles.card}>
      {onPress ? (
        <Pressable
          accessibilityLabel={`Abrir ${item.title}`}
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.cardBody, pressed && styles.pressed]}
        >
          {body}
        </Pressable>
      ) : (
        <View style={styles.cardBody}>{body}</View>
      )}

      {item.kind === 'post' && onToggleLike ? (
        <View style={styles.cardFooter}>
          <Pressable
            accessibilityLabel={item.likedByMe ? 'Remover curtida' : 'Curtir'}
            accessibilityRole="button"
            accessibilityState={{ selected: item.likedByMe }}
            hitSlop={6}
            onPress={onToggleLike}
            style={({ pressed }) => [
              styles.likeButton,
              pressed && styles.pressed,
            ]}
          >
            <AppSymbol
              color={item.likedByMe ? colors.likeActive : colors.textMuted}
              fallback={item.likedByMe ? '♥' : '♡'}
              name={item.likedByMe ? symbols.favorite : symbols.favoriteBorder}
              size={20}
            />
            <Text
              style={[styles.likeText, item.likedByMe && styles.likeTextActive]}
            >
              {item.likedByMe ? 'Curtido' : 'Curtir'} · {item.likeCount ?? 0}
            </Text>
          </Pressable>
          {onPress ? (
            <Pressable
              accessibilityLabel="Ver comentários do post"
              accessibilityRole="button"
              onPress={onPress}
              style={({ pressed }) => [
                styles.commentButton,
                pressed && styles.pressed,
              ]}
            >
              <MessageCircle color={colors.brand} size={18} />
              <Text style={styles.commentText}>Comentários</Text>
            </Pressable>
          ) : null}
        </View>
      ) : item.kind === 'workshop' && onPress ? (
        <View style={styles.cardFooter}>
          <View style={styles.openButton}>
            <Text style={styles.openText}>Ver workshop</Text>
            <AppSymbol
              color={colors.brand}
              fallback="›"
              name={symbols.next}
              size={18}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function FeedScreen({
  items,
  loadingMore = false,
  loadMoreError = false,
  onItemPress,
  onLoadMore,
  onRefresh,
  onRetry,
  onToggleLike,
  refreshing = false,
  source = 'network',
  status,
  error,
}: Props) {
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('pt-BR');
    if (!needle && kindFilter === 'all') return items;
    return items.filter(
      (item) =>
        (kindFilter === 'all' || item.kind === kindFilter) &&
        (!needle ||
          `${item.title} ${item.summary ?? ''}`
            .toLocaleLowerCase('pt-BR')
            .includes(needle)),
    );
  }, [items, kindFilter, query]);
  const frame = (node: React.ReactNode) => (
    <StatePage kind="menu" eyebrow={'Kaizen Workshop'} title={'Feed'}>
      {node}
    </StatePage>
  );
  if (status === 'loading' && items.length === 0)
    return frame(<LoadingState message="Carregando feed" />);
  if (status === 'error' && items.length === 0)
    return frame(
      <ErrorState
        message="Não foi possível carregar o feed."
        error={error}
        onRetry={onRetry}
      />,
    );
  if (items.length === 0)
    return frame(
      <EmptyState
        actionLabel="Atualizar feed"
        message="Novos workshops e publicações aparecerão aqui."
        onAction={onRefresh}
        title="Seu feed está vazio"
      />,
    );

  return (
    <FlatList
      testID="feed-list"
      contentContainerStyle={styles.list}
      data={visible}
      keyExtractor={(item) => `${item.kind}:${item.id}`}
      ListHeaderComponent={
        <View>
          <AppHeader eyebrow="Kaizen Workshop" title="Feed" />
          <Text accessibilityRole="header" style={styles.heading}>
            Seu próximo aprendizado
          </Text>
          <Text style={styles.subheading}>
            Encontre experiências que combinam com você.
          </Text>
          <View style={styles.search}>
            <Search color={colors.textMuted} size={20} />
            <TextInput
              accessibilityLabel="Pesquisar no feed"
              onChangeText={setQuery}
              placeholder="Pesquise por workshops..."
              placeholderTextColor={colors.placeholder}
              returnKeyType="search"
              style={styles.searchInput}
              value={query}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {kindFilters.map((filter) => {
              const selected = filter.value === kindFilter;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={filter.value}
                  onPress={() => setKindFilter(filter.value)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {source === 'cache' ? (
            <InlineNotice
              message="Sem conexão. Exibindo conteúdo salvo neste dispositivo."
              tone="warning"
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.noResults}>
          Nada encontrado para esta busca. Tente outras palavras ou limpe o
          filtro.
        </Text>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            accessibilityLabel="Carregando mais itens"
            accessibilityLiveRegion="polite"
            accessibilityRole="progressbar"
            color={colors.brand}
            style={styles.loadingMore}
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
      refreshControl={
        <RefreshControl
          accessibilityLabel="Atualizar feed"
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
          onToggleLike={onToggleLike ? () => onToggleLike(item) : undefined}
        />
      )}
      style={styles.page}
    />
  );
}

function friendlyContext(value: string) {
  // Posts carry their ISO publication time as context; never show it raw.
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `Publicado em ${new Intl.DateTimeFormat('pt-BR').format(date)}`;
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
  },
  subheading: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    marginTop: spacing.xxs,
  },
  search: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    minHeight: sizes.touchTarget,
  },
  chips: { gap: spacing.xs, paddingVertical: spacing.md },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  chipSelected: { backgroundColor: colors.brand },
  chipText: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
  },
  chipTextSelected: { color: colors.onBrand },
  noResults: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  page: {
    backgroundColor: colors.background,
  },
  list: {
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
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardBody: {
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  cardImage: {
    borderRadius: radii.xl,
    height: 180,
    marginBottom: spacing.md,
    width: '100%',
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  kindBadge: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  kind: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.caption,
    fontWeight: typography.bold,
  },
  highlight: {
    backgroundColor: colors.brand,
    borderRadius: radii.full,
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.caption,
    fontWeight: typography.bold,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
    lineHeight: 28,
  },
  summary: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.xs,
  },
  context: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    marginTop: spacing.sm,
  },
  cardFooter: {
    alignItems: 'center',
    borderTopColor: colors.surface3,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  likeButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizes.touchTarget,
  },
  likeText: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  likeTextActive: {
    color: colors.likeActive,
  },
  commentButton: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: 'auto',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  commentText: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.bodySmall,
    fontWeight: typography.bold,
  },
  openButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 'auto',
    minHeight: sizes.touchTarget,
  },
  openText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  pressed: {
    opacity: 0.65,
  },
  loadingMore: {
    marginVertical: spacing.md,
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
