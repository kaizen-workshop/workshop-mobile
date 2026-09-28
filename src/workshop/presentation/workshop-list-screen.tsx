import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/shared/presentation';
import { colors, spacing, typography } from '@/shared/theme';
import type { WorkshopSummary } from '@/workshop/domain';
import { WorkshopCard } from './workshop-card';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  workshops: readonly WorkshopSummary[];
  refreshing?: boolean;
  onRefresh(): void;
  onRetry?: () => void;
  onOpen?: (workshop: WorkshopSummary) => void;
}>;

export function WorkshopListScreen({
  onOpen,
  onRefresh,
  onRetry,
  refreshing = false,
  status,
  workshops,
}: Props) {
  if (status === 'loading' && workshops.length === 0)
    return <LoadingState message="Carregando workshops" />;
  if (status === 'error' && workshops.length === 0)
    return (
      <ErrorState
        message="Não foi possível carregar os workshops."
        onRetry={onRetry}
      />
    );
  if (workshops.length === 0)
    return (
      <EmptyState
        message="Altere os filtros ou tente novamente mais tarde."
        title="Nenhum workshop encontrado"
      />
    );

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={[...workshops]}
      keyExtractor={(workshop) => workshop.id}
      ListHeaderComponent={
        <Text accessibilityRole="header" style={styles.heading}>
          Workshops
        </Text>
      }
      refreshControl={
        <RefreshControl
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

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  heading: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
  },
});
