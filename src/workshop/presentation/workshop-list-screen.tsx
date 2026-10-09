import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';

import { AppHeader, StatePage } from '@/navigation';
import {
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
import type {
  WorkshopFilterOption,
  WorkshopFilterOptions,
  WorkshopFilters,
  WorkshopStatus,
  WorkshopSummary,
} from '@/workshop/domain';
import { WorkshopCard } from './workshop-card';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  workshops: readonly WorkshopSummary[];
  refreshing?: boolean;
  filtering?: boolean;
  source?: 'network' | 'cache';
  filters?: WorkshopFilters;
  filterOptions?: WorkshopFilterOptions;
  onFiltersChange?: (filters: WorkshopFilters) => void;
  onRefresh(): void;
  onRetry?: () => void;
  onOpen?: (workshop: WorkshopSummary) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMoreError?: boolean;
}>;

export function WorkshopListScreen({
  filtering = false,
  filterOptions,
  filters,
  onFiltersChange,
  onOpen,
  onLoadMore,
  onRefresh,
  onRetry,
  refreshing = false,
  source = 'network',
  status,
  error,
  workshops,
  hasMore = false,
  loadingMore = false,
  loadMoreError = false,
}: Props) {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const frame = (node: React.ReactNode) => (
    <StatePage kind="menu" eyebrow={'Descubra e aprenda'} title={'Workshops'}>
      {node}
    </StatePage>
  );
  if (status === 'loading' && workshops.length === 0)
    return frame(<LoadingState message="Carregando workshops" />);
  if (status === 'error' && workshops.length === 0)
    return frame(
      <ErrorState
        message="Não foi possível carregar os workshops."
        error={error}
        onRetry={onRetry}
      />,
    );
  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={workshops}
      keyExtractor={(workshop) => workshop.id}
      ListHeaderComponent={
        <View>
          <AppHeader
            action={
              filters && filterOptions && onFiltersChange ? (
                <Pressable
                  accessibilityLabel="Mostrar filtros"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: filtersVisible }}
                  onPress={() => setFiltersVisible((current) => !current)}
                  style={styles.filterToggle}
                >
                  <SlidersHorizontal color={colors.text} size={22} />
                </Pressable>
              ) : undefined
            }
            eyebrow="Descubra e aprenda"
            title="Workshops"
          />
          {filtersVisible && filters && filterOptions && onFiltersChange ? (
            <WorkshopFilterBar
              filters={filters}
              onChange={onFiltersChange}
              options={filterOptions}
            />
          ) : null}
          {filtering ? (
            <ActivityIndicator
              accessibilityLabel="Aplicando filtros"
              accessibilityRole="progressbar"
              color={colors.brand}
              style={styles.filtering}
            />
          ) : null}
          {source === 'cache' ? (
            <InlineNotice
              message="Sem conexão. Exibindo workshops salvos neste dispositivo."
              tone="warning"
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          message="Altere os filtros ou tente novamente mais tarde."
          title="Nenhum workshop encontrado"
        />
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            accessibilityLabel="Carregando mais workshops"
            color={colors.brand}
            style={styles.pagination}
          />
        ) : loadMoreError ? (
          <Pressable
            accessibilityRole="button"
            onPress={onLoadMore}
            style={styles.paginationRetry}
          >
            <Text style={styles.paginationRetryText}>
              Tentar carregar mais workshops
            </Text>
          </Pressable>
        ) : null
      }
      onEndReached={hasMore && !loadingMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          accessibilityLabel="Atualizar workshops"
          colors={[colors.brand]}
          onRefresh={onRefresh}
          refreshing={refreshing}
          tintColor={colors.brand}
        />
      }
      renderItem={({ item }) => (
        <WorkshopCard
          onPress={onOpen ? () => onOpen(item) : undefined}
          workshop={item}
        />
      )}
      style={styles.page}
      testID="workshop-list"
    />
  );
}

const statusOptions: readonly WorkshopFilterOption[] = [
  { id: 'DRAFT', name: 'Rascunho' },
  { id: 'SCHEDULED', name: 'Agendado' },
  { id: 'PUBLISHED', name: 'Publicado' },
  { id: 'CLOSED', name: 'Encerrado' },
  { id: 'CANCELLED', name: 'Cancelado' },
  { id: 'ARCHIVED', name: 'Arquivado' },
];

function WorkshopFilterBar({
  filters,
  onChange,
  options,
}: Readonly<{
  filters: WorkshopFilters;
  onChange(filters: WorkshopFilters): void;
  options: WorkshopFilterOptions;
}>) {
  return (
    <View accessibilityLabel="Filtros de workshops" style={styles.filters}>
      <FilterGroup
        label="Status"
        onSelect={(status) =>
          onChange({
            ...filters,
            status: status as WorkshopStatus | undefined,
          })
        }
        options={statusOptions}
        selectedId={filters.status}
      />
      <FilterGroup
        label="Tema"
        onSelect={(themeId) => onChange({ ...filters, themeId })}
        options={options.themes}
        selectedId={filters.themeId}
      />
      <FilterGroup
        label="Categoria"
        onSelect={(categoryId) => onChange({ ...filters, categoryId })}
        options={options.categories}
        selectedId={filters.categoryId}
      />
    </View>
  );
}

function FilterGroup({
  label,
  onSelect,
  options,
  selectedId,
}: Readonly<{
  label: string;
  onSelect(id: string | undefined): void;
  options: readonly WorkshopFilterOption[];
  selectedId?: string;
}>) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChoices}
      >
        <FilterChip
          label="Todos"
          onPress={() => onSelect(undefined)}
          selected={!selectedId}
        />
        {options.map((option) => (
          <FilterChip
            key={option.id}
            label={option.name}
            onPress={() => onSelect(option.id)}
            selected={selectedId === option.id}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function FilterChip({
  label,
  onPress,
  selected,
}: Readonly<{ label: string; onPress(): void; selected: boolean }>) {
  return (
    <Pressable
      accessibilityLabel={`Filtrar por ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.filterChip, selected && styles.filterChipSelected]}
    >
      <Text
        style={[
          styles.filterChipText,
          selected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
  },
  content: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  filters: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.surface3,
    borderRadius: radii.xxl,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  filterToggle: {
    alignItems: 'center',
    borderColor: colors.surface3,
    borderRadius: radii.full,
    borderWidth: 1,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  filterGroup: {
    marginBottom: spacing.sm,
  },
  filterLabel: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.label,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
  },
  filterChoices: {
    gap: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  filterChipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterChipText: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
  filterChipTextSelected: {
    color: colors.onBrand,
  },
  filtering: {
    marginBottom: spacing.sm,
  },
  pagination: {
    marginVertical: spacing.md,
  },
  paginationRetry: {
    alignItems: 'center',
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  paginationRetryText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
});
