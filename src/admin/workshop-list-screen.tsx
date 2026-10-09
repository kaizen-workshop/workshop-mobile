import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  statusLabels,
  type ManagedWorkshop,
  type WorkshopStatus,
} from './admin';
import {
  AdminPage,
  Card,
  ChoiceChips,
  Heading,
  PrimaryButton,
  StatusChip,
} from './admin-ui';
import { formatDate } from './workshop-form';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';

type Filter = WorkshopStatus | 'ALL';

const filters: readonly { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunhos' },
  { value: 'PUBLISHED', label: 'Publicados' },
  { value: 'CLOSED', label: 'Encerrados' },
  { value: 'CANCELLED', label: 'Cancelados' },
];

const tones: Partial<
  Record<WorkshopStatus, { background: string; color: string }>
> = {
  PUBLISHED: { background: colors.positiveSoft, color: colors.positive },
  CANCELLED: { background: colors.dangerSoft, color: colors.danger },
  DRAFT: { background: colors.warningSoft, color: colors.warning },
};

export function ManagedWorkshopListScreen({
  error,
  hasMore,
  items,
  onCreate,
  onLoadMore,
  onOpen,
  onRetry,
  status,
}: Readonly<{
  error?: unknown;
  hasMore: boolean;
  items: readonly ManagedWorkshop[];
  onCreate(): void;
  onLoadMore(): void;
  onOpen(workshop: ManagedWorkshop): void;
  onRetry(): void;
  status: 'loading' | 'error' | 'success';
}>) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const visible = useMemo(
    () => (filter === 'ALL' ? items : items.filter((i) => i.status === filter)),
    [filter, items],
  );

  const frame = (node: React.ReactNode) => (
    <StatePage
      eyebrow="ARWEG · Administrativo"
      fallback="/admin"
      kind="back"
      title="Meus workshops"
    >
      {node}
    </StatePage>
  );
  if (status === 'loading' && items.length === 0)
    return frame(<LoadingState message="Carregando workshops..." />);
  if (status === 'error' && items.length === 0)
    return frame(<ErrorState error={error} onRetry={onRetry} />);

  return (
    <AdminPage title="Meus workshops">
      <Heading
        title="Gerencie seus workshops"
        subtitle="Toque em um workshop para publicar, editar, cancelar ou ver participantes."
      />
      <PrimaryButton label="+ Novo workshop" onPress={onCreate} />
      <ChoiceChips<Filter>
        label="Filtrar por situação"
        onChange={setFilter}
        options={filters}
        value={filter}
      />
      {visible.length === 0 ? (
        <Card>
          <Text style={styles.empty}>
            {items.length === 0
              ? 'Você ainda não criou workshops. Toque em "+ Novo workshop" para começar.'
              : 'Nenhum workshop nesta situação.'}
          </Text>
        </Card>
      ) : (
        visible.map((workshop) => {
          const tone = tones[workshop.status];
          return (
            <Pressable
              accessibilityLabel={`Gerenciar ${workshop.title}`}
              accessibilityRole="button"
              key={workshop.id}
              onPress={() => onOpen(workshop)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.row}>
                <Text style={styles.title}>{workshop.title}</Text>
                <StatusChip
                  background={tone?.background}
                  color={tone?.color}
                  label={statusLabels[workshop.status]}
                />
              </View>
              <Text style={styles.meta}>
                {formatDate(workshop.startDate)} ·{' '}
                {workshop.startTime.slice(0, 5)} · {workshop.location}
              </Text>
              <Text style={styles.meta}>
                {workshop.maximumParticipants} vagas ·{' '}
                {workshop.price > 0
                  ? `R$ ${workshop.price.toFixed(2).replace('.', ',')}`
                  : 'Gratuito'}
              </Text>
            </Pressable>
          );
        })
      )}
      {hasMore ? (
        <Pressable
          accessibilityRole="button"
          onPress={onLoadMore}
          style={styles.more}
        >
          <Text style={styles.moreText}>Carregar mais</Text>
        </Pressable>
      ) : null}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  pressed: { opacity: 0.72 },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
  },
  more: { alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  moreText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
});
