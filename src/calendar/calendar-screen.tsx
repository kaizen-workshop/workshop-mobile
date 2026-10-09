import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  buildMonthGrid,
  monthTitle,
  occursOn,
  parseIsoDate,
  selectedDayTitle,
  weekdayInitials,
} from './month-calendar';
import type { ParticipantWorkshop } from './participant-workshop';
import { BackHeader, StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

const fallback = '/(authenticated)/(tabs)/profile';

export type CalendarMonth = Readonly<{ year: number; month: number }>;

export function CalendarScreen({
  error,
  items,
  month,
  onChangeMonth,
  onOpen,
  onRetry,
  onSelectDate,
  selectedDate,
  status,
  today,
}: Readonly<{
  error?: unknown;
  items: readonly ParticipantWorkshop[];
  month: CalendarMonth;
  onChangeMonth(delta: -1 | 1): void;
  onOpen(item: ParticipantWorkshop): void;
  onRetry(): void;
  onSelectDate(isoDate: string): void;
  selectedDate: string;
  status: 'loading' | 'error' | 'success';
  today: string;
}>) {
  const grid = buildMonthGrid(month.year, month.month);
  const dayItems = items.filter((item) => occursOn(item, selectedDate));
  const selectedLabel = selectedDayTitle(selectedDate);
  const selectedShort = selectedLabel.split(', ')[1];

  if (status === 'error' && items.length === 0)
    return (
      <StatePage fallback={fallback} kind="back" title="Calendário">
        <ErrorState error={error} onRetry={onRetry} />
      </StatePage>
    );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <BackHeader fallback={fallback} title="Calendário" />

      <View style={styles.card}>
        <View style={styles.monthRow}>
          <Pressable
            accessibilityLabel="Mês anterior"
            accessibilityRole="button"
            onPress={() => onChangeMonth(-1)}
            style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
          >
            <ChevronLeft color={colors.textMuted} size={22} />
          </Pressable>
          <Text accessibilityRole="header" style={styles.monthTitle}>
            {monthTitle(month.year, month.month)}
          </Text>
          <Pressable
            accessibilityLabel="Próximo mês"
            accessibilityRole="button"
            onPress={() => onChangeMonth(1)}
            style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
          >
            <ChevronRight color={colors.textMuted} size={22} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {weekdayInitials.map((initial, index) => (
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no"
              key={`${initial}-${index}`}
              style={styles.weekday}
            >
              {initial}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {grid.map((cell) => {
            const selected = cell.date === selectedDate;
            const hasWorkshop = items.some((item) => occursOn(item, cell.date));
            return (
              <Pressable
                accessibilityLabel={`${cell.day} de ${monthTitle(
                  parseIsoDate(cell.date).getFullYear(),
                  parseIsoDate(cell.date).getMonth(),
                ).toLowerCase()}${hasWorkshop ? ', com workshop' : ''}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={cell.date}
                onPress={() => onSelectDate(cell.date)}
                style={styles.cellWrap}
              >
                <View style={[styles.cell, selected && styles.cellSelected]}>
                  <Text
                    style={[
                      styles.cellText,
                      !cell.inMonth && styles.cellTextMuted,
                      cell.date === today && !selected && styles.cellToday,
                      selected && styles.cellTextSelected,
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {hasWorkshop && !selected ? (
                    <View style={styles.cellDot} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>
            Dia selecionado · {selectedShort}
          </Text>
        </View>
      </View>

      <Text accessibilityRole="header" style={styles.dayTitle}>
        {selectedLabel}
      </Text>

      {status === 'loading' ? (
        <LoadingState message="Carregando workshops do mês..." />
      ) : dayItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nenhum workshop neste dia. Escolha outra data no calendário.
          </Text>
        </View>
      ) : (
        dayItems.map((item) => (
          <Pressable
            accessibilityLabel={`Abrir ${item.title}`}
            accessibilityRole="button"
            key={item.id}
            onPress={() => onOpen(item)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={styles.iconTile}>
              <CalendarDays color={colors.accent} size={22} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTime}>{formatTime(item)}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

function formatTime(item: ParticipantWorkshop) {
  const [hours, minutes] = item.startTime.split(':');
  return `${hours}h${minutes}`;
}

const styles = StyleSheet.create({
  page: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.md,
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrow: {
    alignItems: 'center',
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  monthTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  weekRow: { flexDirection: 'row', marginTop: spacing.xs },
  weekday: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    textAlign: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs },
  cellWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    width: `${100 / 7}%`,
  },
  cell: {
    alignItems: 'center',
    borderRadius: radii.xl,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  cellSelected: { backgroundColor: colors.brand },
  cellText: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
  },
  cellTextMuted: { color: colors.disabled },
  cellToday: { color: colors.accent, fontFamily: typography.familyBold },
  cellTextSelected: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
  },
  cellDot: {
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    bottom: 3,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  legendDot: {
    backgroundColor: colors.brand,
    borderRadius: radii.full,
    height: 6,
    width: 6,
  },
  legendText: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
  },
  dayTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
    marginTop: spacing.sm,
  },
  empty: { paddingVertical: spacing.md },
  emptyText: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  item: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  pressed: { opacity: 0.72 },
  iconTile: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.xl,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  itemText: { flex: 1 },
  itemTime: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
  },
  itemTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
});
