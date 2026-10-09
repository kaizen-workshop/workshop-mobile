import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { WorkshopGroup } from './group';
import { AppHeader, StatePage } from '@/navigation';
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

const symbols = {
  group: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
  next: {
    ios: 'chevron.right',
    android: 'chevron_right',
    web: 'chevron_right',
  },
} as const;

export type GroupPreview = Readonly<{
  author: string;
  text: string;
  /** Already formatted, e.g. "09:42" or "09/10". */
  time: string;
}>;

export function GroupListScreen({
  items,
  status,
  error,
  onRetry,
  onOpen,
  previews = {},
}: {
  items: readonly WorkshopGroup[];
  /** Last message of each conversation, keyed by group id. */
  previews?: Readonly<Record<string, GroupPreview>>;
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  onRetry(): void;
  onOpen(group: WorkshopGroup): void;
}) {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('pt-BR');
    return needle
      ? items.filter((item) =>
          item.workshopTitle.toLocaleLowerCase('pt-BR').includes(needle),
        )
      : items;
  }, [items, query]);
  const frame = (node: React.ReactNode) => (
    <StatePage kind="menu" eyebrow={'Comunidade'} title={'Meus grupos'}>
      {node}
    </StatePage>
  );
  if (status === 'loading')
    return frame(<LoadingState message="Carregando grupos..." />);
  if (status === 'error')
    return frame(
      <ErrorState
        message="Não foi possível carregar seus grupos."
        error={error}
        onRetry={onRetry}
      />,
    );
  return (
    <View style={styles.page}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={visible.length ? styles.list : styles.empty}
        ListHeaderComponent={
          <View>
            <AppHeader eyebrow="Comunidade" title="Conversas" />
            {items.length > 0 ? (
              <View style={styles.search}>
                <Search color={colors.textMuted} size={20} />
                <TextInput
                  accessibilityLabel="Pesquisar conversas"
                  onChangeText={setQuery}
                  placeholder="Pesquise por workshops..."
                  placeholderTextColor={colors.placeholder}
                  style={styles.searchInput}
                  value={query}
                />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          items.length === 0 ? (
            <EmptyState message="Você não participa de nenhum grupo acessível." />
          ) : (
            <EmptyState message="Nenhuma conversa com esse nome." />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir grupo ${item.workshopTitle}`}
            onPress={() => onOpen(item)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View
              style={[
                styles.groupIcon,
                !item.active && styles.groupIconInactive,
              ]}
            >
              <AppSymbol
                color={item.active ? colors.brand : colors.textMuted}
                fallback="G"
                name={symbols.group}
                size={22}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.workshopTitle}</Text>
              {previews[item.id] ? (
                <Text numberOfLines={1} style={styles.preview}>
                  {previews[item.id].author}: {previews[item.id].text}
                </Text>
              ) : null}
              <Text style={[styles.status, item.active && styles.statusActive]}>
                {item.active ? 'Grupo ativo' : 'Grupo encerrado'}
              </Text>
            </View>
            {previews[item.id] ? (
              <Text style={styles.time}>{previews[item.id].time}</Text>
            ) : null}
            <AppSymbol
              color={colors.textMuted}
              fallback="›"
              name={symbols.next}
              size={20}
            />
          </Pressable>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  search: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
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
  preview: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    marginTop: 2,
  },
  time: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
  },
  page: { backgroundColor: colors.background, flex: 1 },
  list: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  empty: { flexGrow: 1 },
  card: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.surface3,
    borderRadius: radii.xxl,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  pressed: { opacity: 0.68 },
  groupIcon: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 48,
  },
  groupIconInactive: { backgroundColor: colors.surface2 },
  cardContent: { flex: 1 },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
  },
  status: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    marginTop: spacing.xxs,
  },
  statusActive: { color: colors.positive },
});
