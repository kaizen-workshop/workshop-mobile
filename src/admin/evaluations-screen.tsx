import { StyleSheet, Text, View } from 'react-native';

import type { EvaluationSummary, WorkshopEvaluation } from './admin';
import { AdminPage, Card, Heading, SectionTitle } from './admin-ui';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';
import { colors, radii, spacing, typography } from '@/shared/theme';

export function formatAverage(value: number | null) {
  return value === null ? '—' : value.toFixed(1).replace('.', ',');
}

export function EvaluationsScreen({
  error,
  evaluations,
  onRetry,
  status,
  summary,
  title,
}: Readonly<{
  error?: unknown;
  evaluations: readonly WorkshopEvaluation[];
  onRetry(): void;
  status: 'loading' | 'error' | 'success';
  summary?: EvaluationSummary;
  title: string;
}>) {
  if (status !== 'success' || !summary)
    return (
      <StatePage
        eyebrow="ARWEG · Administrativo"
        fallback="/admin/workshops"
        kind="back"
        title="Avaliações"
      >
        {status === 'loading' ? (
          <LoadingState message="Carregando avaliações..." />
        ) : (
          <ErrorState error={error} onRetry={onRetry} />
        )}
      </StatePage>
    );

  const rows: readonly [string, number | null][] = [
    ['Experiência geral', summary.averageRating],
    ['Conteúdo', summary.averageContentRating],
    ['Instrutor', summary.averageInstructorRating],
    ['Organização', summary.averageOrganizationRating],
  ];
  const withComment = evaluations.filter((e) => e.comment?.trim());

  return (
    <AdminPage fallback="/admin/workshops" title="Avaliações">
      <Heading
        title={title}
        subtitle="O retorno dos participantes que concluíram o workshop."
      />
      {summary.total === 0 ? (
        <Card>
          <Text style={styles.empty}>
            Ainda não há avaliações. Elas ficam disponíveis depois que o
            workshop termina e os participantes enviam a opinião.
          </Text>
        </Card>
      ) : (
        <>
          <Card>
            <View style={styles.hero}>
              <Text style={styles.heroValue}>
                {formatAverage(summary.averageRating)}
                <Text style={styles.heroOf}> de 5</Text>
              </Text>
              <Text style={styles.muted}>
                {`${summary.total} ${summary.total === 1 ? 'resposta' : 'respostas'}`}
              </Text>
            </View>
            {rows.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text
                  accessibilityLabel={`${label}: ${formatAverage(value)} de 5`}
                  style={styles.rowValue}
                >
                  {formatAverage(value)} / 5
                </Text>
              </View>
            ))}
          </Card>

          <Card>
            <SectionTitle>{`Comentários (${withComment.length})`}</SectionTitle>
            {withComment.length === 0 ? (
              <Text style={styles.muted}>Nenhum comentário escrito.</Text>
            ) : (
              withComment.map((evaluation) => (
                <View key={evaluation.id} style={styles.comment}>
                  <Text style={styles.commentRating}>
                    {`${evaluation.rating} de 5`}
                  </Text>
                  <Text style={styles.commentText}>{evaluation.comment}</Text>
                </View>
              ))
            )}
          </Card>
        </>
      )}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.xxs, paddingVertical: spacing.sm },
  heroValue: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: 44,
    fontWeight: typography.bold,
  },
  heroOf: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
  },
  row: {
    borderTopColor: colors.surface3,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  rowLabel: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
  },
  rowValue: {
    color: colors.accent,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  comment: {
    backgroundColor: colors.background,
    borderRadius: radii.xl,
    gap: spacing.xxs,
    padding: spacing.sm,
  },
  commentRating: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
  },
  commentText: {
    color: colors.text,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
});
