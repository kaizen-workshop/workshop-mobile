import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/shared/presentation';
import { colors, spacing, typography } from '@/shared/theme';
import type { WorkshopSummary } from '@/workshop/domain';
import { WorkshopCard } from './workshop-card';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  workshops: readonly WorkshopSummary[];
  refreshing?: boolean;
  source?: 'network' | 'cache';
  onRefresh(): void;
  onRetry?: () => void;
  onOpen?: (workshop: WorkshopSummary) => void;
}>;

export function WorkshopListScreen({
  onOpen,
  onRefresh,
  onRetry,
  refreshing = false,
  source = 'network',
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
      data={workshops}
      keyExtractor={(workshop) => workshop.id}
      ListHeaderComponent={
        <View>
          <Text accessibilityRole="header" style={styles.heading}>
            Workshops
          </Text>
          {source === 'cache' ? (
            <Text accessibilityRole="alert" style={styles.cachedNotice}>
              Sem conexão. Exibindo workshops salvos neste dispositivo.
            </Text>
          ) : null}
        </View>
      }
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
  cachedNotice: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.label,
    marginBottom: spacing.md,
  },
});
