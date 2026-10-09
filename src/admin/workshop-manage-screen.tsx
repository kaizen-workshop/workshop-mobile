import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  availableTransitions,
  isEditable,
  statusLabels,
  type ManagedWorkshop,
  type WorkshopTransition,
} from './admin';
import {
  AdminPage,
  Card,
  DangerButton,
  Heading,
  LinkButton,
  Notice,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  StatusChip,
} from './admin-ui';
import { formatDate } from './workshop-form';
import { colors, spacing, typography } from '@/shared/theme';

const actionLabels: Record<WorkshopTransition, string> = {
  publish: 'Publicar workshop',
  close: 'Encerrar workshop',
  cancel: 'Cancelar workshop',
  archive: 'Arquivar workshop',
};

/** Consequences shown before an irreversible step (Nielsen: error prevention). */
const confirmations: Partial<
  Record<
    WorkshopTransition,
    { title: string; body: string; confirm: string; keep: string }
  >
> = {
  close: {
    title: 'Encerrar este workshop?',
    body: 'O workshop deixa de poder ser alterado e o grupo de conversa é desativado. Isso não pode ser desfeito.',
    confirm: 'Confirmar encerramento',
    keep: 'Manter workshop',
  },
  cancel: {
    title: 'Cancelar a realização?',
    body: 'O workshop passa a constar como cancelado e o grupo de conversa é desativado. Isso não pode ser desfeito.',
    confirm: 'Confirmar cancelamento',
    keep: 'Manter workshop',
  },
  archive: {
    title: 'Arquivar este workshop?',
    body: 'O workshop sai das listas ativas. Isso não pode ser desfeito.',
    confirm: 'Confirmar arquivamento',
    keep: 'Voltar',
  },
};

export function WorkshopManageScreen({
  busy,
  feedback,
  onEdit,
  onOpenMedia,
  onOpenParticipants,
  onTransition,
  workshop,
}: Readonly<{
  busy: boolean;
  feedback?: { tone: 'danger' | 'success'; message: string };
  onEdit(): void;
  onOpenMedia(): void;
  onOpenParticipants(): void;
  onTransition(action: WorkshopTransition): void;
  workshop: ManagedWorkshop;
}>) {
  const [pending, setPending] = useState<WorkshopTransition | null>(null);
  const transitions = availableTransitions(workshop.status);
  const confirmation = pending ? confirmations[pending] : undefined;

  const request = (action: WorkshopTransition) => {
    if (confirmations[action]) setPending(action);
    else onTransition(action);
  };

  return (
    <AdminPage fallback="/admin/workshops" title="Gerenciar workshop">
      <Heading
        title={workshop.title}
        subtitle={`${formatDate(workshop.startDate)} · ${workshop.startTime.slice(0, 5)} · ${workshop.location}`}
      />
      <StatusChip label={statusLabels[workshop.status]} />

      {feedback ? (
        <Notice tone={feedback.tone}>{feedback.message}</Notice>
      ) : null}

      {confirmation && pending ? (
        <Card>
          <SectionTitle>{confirmation.title}</SectionTitle>
          <Text style={styles.body}>{confirmation.body}</Text>
          <DangerButton
            busy={busy}
            label={confirmation.confirm}
            onPress={() => {
              onTransition(pending);
              setPending(null);
            }}
          />
          <LinkButton
            label={confirmation.keep}
            onPress={() => setPending(null)}
          />
        </Card>
      ) : (
        <>
          <Card>
            <SectionTitle>Resumo</SectionTitle>
            <Row label="Vagas" value={String(workshop.maximumParticipants)} />
            <Row
              label="Valor"
              value={
                workshop.price > 0
                  ? `R$ ${workshop.price.toFixed(2).replace('.', ',')}`
                  : 'Gratuito'
              }
            />
            <Row
              label="Inscrições até"
              value={formatDate(workshop.registrationEnd.slice(0, 10))}
            />
          </Card>

          <Card>
            <SectionTitle>Ações</SectionTitle>
            {transitions.includes('publish') ? (
              <PrimaryButton
                busy={busy}
                label={actionLabels.publish}
                onPress={() => request('publish')}
              />
            ) : null}
            {isEditable(workshop.status) ? (
              <SecondaryButton label="Editar workshop" onPress={onEdit} />
            ) : (
              <Text style={styles.hint}>
                Apenas rascunhos e workshops agendados podem ser editados.
              </Text>
            )}
            <SecondaryButton label="Imagem e anexos" onPress={onOpenMedia} />
            <SecondaryButton
              label="Participantes e pagamentos"
              onPress={onOpenParticipants}
            />
            {transitions
              .filter((action) => action !== 'publish')
              .map((action) => (
                <DangerButton
                  busy={busy}
                  key={action}
                  label={actionLabels[action]}
                  onPress={() => request(action)}
                />
              ))}
          </Card>
        </>
      )}
    </AdminPage>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowLabel: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  rowValue: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
});
