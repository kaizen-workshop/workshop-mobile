import { CalendarDays, X } from 'lucide-react-native';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { monthHeading } from './month-calendar';
import type {
  HistoryFilter,
  ParticipantWorkshop,
  ParticipantWorkshopStatus,
} from './participant-workshop';
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

const fallback = '/(authenticated)/(tabs)/profile';

const historyFilters: readonly { value: HistoryFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'COMPLETED', label: 'Concluídos' },
  { value: 'CANCELLED', label: 'Cancelados' },
  { value: 'FUTURE', label: 'Futuros' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'WAITING_LIST', label: 'Lista de espera' },
];

const statusChips: Record<
  ParticipantWorkshopStatus,
  { label: string; background: string; color: string }
> = {
  COMPLETED: {
    label: 'Concluído',
    background: colors.positiveSoft,
    color: colors.positive,
  },
  CANCELLED: {
    label: 'Cancelado',
    background: colors.dangerSoft,
    color: colors.danger,
  },
  WAITING_LIST: {
    label: 'Em espera',
    background: colors.warningSoft,
    color: colors.warning,
  },
  FUTURE: {
    label: 'Inscrito',
    background: colors.brandSubtle,
    color: colors.accent,
  },
  IN_PROGRESS: {
    label: 'Em andamento',
    background: colors.brandSubtle,
    color: colors.accent,
  },
};

export function ParticipantWorkshopScreen({
  emptyMessage,
  items,
  status,
  error,
  loadingMore,
  onRetry,
  onLoadMore,
  onOpen,
  onDiscover,
  selectedFilter,
  onSelectFilter,
}: {
  emptyMessage: string;
  items: readonly ParticipantWorkshop[];
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  loadingMore?: boolean;
  onRetry(): void;
  onLoadMore?: () => void;
  onOpen(item: ParticipantWorkshop): void;
  onDiscover?: () => void;
  selectedFilter: HistoryFilter;
  onSelectFilter(filter: HistoryFilter): void;
}) {
  const frame = (node: React.ReactNode) => (
    <StatePage fallback={fallback} kind="back" title="Histórico de workshops">
      {node}
    </StatePage>
  );
  if (status === 'loading' && items.length === 0)
    return frame(<LoadingState message="Carregando histórico..." />);
  if (status === 'error' && items.length === 0)
    return frame(<ErrorState error={error} onRetry={onRetry} />);

  const header = (
    <View>
      <BackHeader fallback={fallback} title="Histórico de workshops" />
      <Text accessibilityRole="header" style={styles.heading}>
        Experiências que ficam
      </Text>
      <Text style={styles.subheading}>
        Reveja suas participações e inscrições anteriores.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {historyFilters.map((filter) => {
          const selected = filter.value === selectedFilter;
          return (
            <Pressable
              key={filter.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelectFilter(filter.value)}
              style={({ pressed }) => [
                styles.filter,
                selected && styles.filterSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const endOfList = !onLoadMore && items.length > 0;

  return (
    <View style={styles.page}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState message={emptyMessage} />}
        ListFooterComponent={
          <View style={styles.footer}>
            {loadingMore ? (
              <Text style={styles.footerText}>Carregando mais...</Text>
            ) : null}
            {endOfList ? (
              <Text style={styles.footerText}>
                Você chegou ao fim do histórico.
              </Text>
            ) : null}
            {onDiscover ? (
              <Pressable
                accessibilityRole="button"
                onPress={onDiscover}
                style={({ pressed }) => [
                  styles.discover,
                  pressed && styles.discoverPressed,
                ]}
              >
                <Text style={styles.discoverText}>
                  Descobrir novos workshops
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item, index }) => {
          const heading = monthHeading(item.startDate);
          const showHeading =
            index === 0 || monthHeading(items[index - 1].startDate) !== heading;
          const chip = item.historyStatus
            ? statusChips[item.historyStatus]
            : undefined;
          const Icon = item.historyStatus === 'CANCELLED' ? X : CalendarDays;
          return (
            <View>
              {showHeading ? (
                <Text accessibilityRole="header" style={styles.month}>
                  {heading}
                </Text>
              ) : null}
              <Pressable
                accessibilityLabel={`Abrir ${item.title}`}
                accessibilityRole="button"
                onPress={() => onOpen(item)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.iconTile}>
                    <Icon color={colors.accent} size={22} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.meta}>{formatWhen(item)}</Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  {chip ? (
                    <View
                      style={[
                        styles.chip,
                        { backgroundColor: chip.background },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: chip.color }]}>
                        {chip.label}
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <Text style={styles.details}>Ver detalhes →</Text>
                </View>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

function formatWhen(item: ParticipantWorkshop) {
  const date = item.startDate.split('-').reverse().join('/');
  const [hours, minutes] = item.startTime.split(':');
  return `${date} · ${hours}${minutes === '00' ? 'h' : `h${minutes}`}`;
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  list: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  heading: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
    marginTop: spacing.xs,
  },
  subheading: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    marginTop: spacing.xxs,
  },
  filters: { gap: spacing.xs, paddingVertical: spacing.md },
  filter: {
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  filterSelected: { backgroundColor: colors.brand },
  filterText: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
  },
  filterTextSelected: { color: colors.onBrand },
  month: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  pressed: { opacity: 0.72 },
  cardTop: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  iconTile: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.xl,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  cardText: { flex: 1 },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    marginTop: 2,
  },
  cardBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  chipText: {
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
  },
  details: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  footer: { gap: spacing.md, marginTop: spacing.sm },
  footerText: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  discover: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
  },
  discoverPressed: { backgroundColor: colors.brandPressed },
  discoverText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
});
