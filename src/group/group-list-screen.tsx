import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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

export function GroupListScreen({
  items,
  status,
  error,
  onRetry,
  onOpen,
}: {
  items: readonly WorkshopGroup[];
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  onRetry(): void;
  onOpen(group: WorkshopGroup): void;
}) {
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
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={items.length ? styles.list : styles.empty}
        ListHeaderComponent={
          <AppHeader eyebrow="Comunidade" title="Meus grupos" />
        }
        ListEmptyComponent={
          <EmptyState message="Você não participa de nenhum grupo acessível." />
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
              <Text style={[styles.status, item.active && styles.statusActive]}>
                {item.active ? 'Grupo ativo' : 'Grupo encerrado'}
              </Text>
            </View>
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
