import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  ParticipantWorkshop,
  ParticipantWorkshopFilter,
} from './participant-workshop';
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

const symbols = {
  calendar: {
    ios: 'calendar',
    android: 'calendar_month',
    web: 'calendar_month',
  },
  location: { ios: 'mappin', android: 'location_on', web: 'location_on' },
  next: {
    ios: 'chevron.right',
    android: 'chevron_right',
    web: 'chevron_right',
  },
} as const;

export function ParticipantWorkshopScreen({
  title,
  emptyMessage,
  items,
  status,
  loadingMore,
  onRetry,
  onLoadMore,
  onOpen,
  selectedFilter,
  onSelectFilter,
}: {
  title: string;
  emptyMessage: string;
  items: readonly ParticipantWorkshop[];
  status: 'loading' | 'error' | 'success';
  loadingMore?: boolean;
  onRetry(): void;
  onLoadMore?: () => void;
  onOpen(item: ParticipantWorkshop): void;
  selectedFilter?: ParticipantWorkshopFilter;
  onSelectFilter?(filter: ParticipantWorkshopFilter): void;
}) {
  if (status === 'loading' && items.length === 0) return <LoadingState />;
  if (status === 'error' && items.length === 0)
    return <ErrorState onRetry={onRetry} />;
  return (
    <View style={styles.page}>
      <View style={styles.headerBlock}>
        <AppHeader eyebrow="Sua jornada" title={title} />
        {selectedFilter && onSelectFilter ? (
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
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={items.length ? styles.list : styles.empty}
        ListEmptyComponent={<EmptyState message={emptyMessage} />}
        ListFooterComponent={
          loadingMore ? (
            <Text style={styles.loadingMore}>Carregando mais...</Text>
          ) : null
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.title}`}
            onPress={() => onOpen(item)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.metaLine}>
                <AppSymbol
                  color={colors.textMuted}
                  fallback="D"
                  name={symbols.calendar}
                  size={17}
                />
                <Text style={styles.meta}>
                  {formatDates(item)} · {item.startTime.slice(0, 5)}–
                  {item.endTime.slice(0, 5)}
                </Text>
              </View>
              <View style={styles.metaLine}>
                <AppSymbol
                  color={colors.textMuted}
                  fallback="L"
                  name={symbols.location}
                  size={17}
                />
                <Text style={styles.meta}>
                  {item.location} · {formatModality(item.modality)}
                </Text>
              </View>
            </View>
            <AppSymbol
              color={colors.brand}
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

const historyFilters: readonly {
  value: ParticipantWorkshopFilter;
  label: string;
}[] = [
  { value: 'FUTURE', label: 'Futuros' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluídos' },
  { value: 'CANCELLED', label: 'Cancelados' },
  { value: 'WAITING_LIST', label: 'Lista de espera' },
];

function formatDates(item: ParticipantWorkshop) {
  const format = (value: string) => value.split('-').reverse().join('/');
  return item.startDate === item.endDate
    ? format(item.startDate)
    : `${format(item.startDate)} a ${format(item.endDate)}`;
}
function formatModality(value: string) {
  return (
    { IN_PERSON: 'Presencial', ONLINE: 'Online', HYBRID: 'Híbrido' }[value] ??
    value
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  headerBlock: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    width: '100%',
  },
  filters: { gap: spacing.xs, paddingBottom: spacing.md },
  filter: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  filterSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterText: { color: colors.text, fontFamily: typography.familyMedium },
  filterTextSelected: { color: colors.onBrand },
  list: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    paddingTop: 0,
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
  cardContent: { flex: 1 },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
  },
  meta: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  metaLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  loadingMore: {
    color: colors.textMuted,
    padding: spacing.md,
    textAlign: 'center',
  },
});
