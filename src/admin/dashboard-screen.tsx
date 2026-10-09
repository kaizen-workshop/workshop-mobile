import { StyleSheet, Text, View } from 'react-native';

import type { Dashboard } from './admin';
import {
  AdminPage,
  Card,
  Heading,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
} from './admin-ui';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ErrorState, LoadingState } from '@/shared/presentation';
import { StatePage } from '@/navigation';

export function DashboardScreen({
  dashboard,
  error,
  onCreateAnnouncement,
  onCreatePost,
  onCreateWorkshop,
  onManageTaxonomies,
  onOpenWorkshops,
  onRetry,
  status,
}: Readonly<{
  dashboard?: Dashboard;
  error?: unknown;
  onCreateAnnouncement(): void;
  onCreatePost(): void;
  onCreateWorkshop(): void;
  /** Only for ADMIN accounts. */
  onManageTaxonomies?: () => void;
  onOpenWorkshops(): void;
  onRetry(): void;
  status: 'loading' | 'error' | 'success';
}>) {
  const frame = (node: React.ReactNode) => (
    <StatePage
      eyebrow="ARWEG · Administrativo"
      fallback="/(authenticated)/(tabs)/feed"
      kind="back"
      title="Dashboard"
    >
      {node}
    </StatePage>
  );
  if (status === 'loading')
    return frame(<LoadingState message="Carregando painel..." />);
  if (status === 'error' || !dashboard)
    return frame(
      <ErrorState
        error={error}
        message="Não foi possível carregar o painel."
        onRetry={onRetry}
      />,
    );

  return (
    <AdminPage fallback="/(authenticated)/(tabs)/feed" title="Dashboard">
      <Heading
        title="Visão geral"
        subtitle="Acompanhe workshops e inscrições da ARWEG."
      />
      <View style={styles.grid}>
        <Tile
          label="Workshops publicados"
          value={dashboard.publishedWorkshops}
        />
        <Tile label="Inscrições" value={dashboard.registrations} />
        <Tile label="Confirmadas" value={dashboard.confirmedRegistrations} />
        <Tile
          label="Na lista de espera"
          value={dashboard.waitingListRegistrations}
        />
      </View>
      <Card>
        <SectionTitle>Ações rápidas</SectionTitle>
        <PrimaryButton label="+ Criar workshop" onPress={onCreateWorkshop} />
        <SecondaryButton label="+ Criar post" onPress={onCreatePost} />
        <SecondaryButton
          label="Enviar comunicado"
          onPress={onCreateAnnouncement}
        />
        {onManageTaxonomies ? (
          <SecondaryButton
            label="Categorias e temas"
            onPress={onManageTaxonomies}
          />
        ) : null}
        <SecondaryButton
          label={`Meus workshops (${dashboard.workshops})`}
          onPress={onOpenWorkshops}
        />
      </Card>
    </AdminPage>
  );
}

function Tile({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={styles.tile}
    >
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.md,
  },
  tileValue: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
  },
  tileLabel: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    marginTop: spacing.xxs,
  },
});
