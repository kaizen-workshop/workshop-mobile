import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { postStatusLabels, type ManagedPost } from './admin';
import {
  AdminPage,
  Card,
  DangerButton,
  Heading,
  LinkButton,
  Notice,
  PrimaryButton,
  SecondaryButton,
  StatusChip,
} from './admin-ui';
import { SchedulePanel } from './schedule-panel';
import { formatScheduled } from './schedule';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';
import { colors, spacing, typography } from '@/shared/theme';

type Panel =
  | { kind: 'schedule'; post: ManagedPost }
  | { kind: 'archive'; post: ManagedPost }
  | undefined;

const tones: Partial<
  Record<ManagedPost['status'], { background: string; color: string }>
> = {
  PUBLISHED: { background: colors.positiveSoft, color: colors.positive },
  DRAFT: { background: colors.warningSoft, color: colors.warning },
};

export function PostListScreen({
  busyId,
  error,
  feedback,
  onArchive,
  onCreate,
  onEdit,
  onPublish,
  onRetry,
  onSchedule,
  posts,
  status,
}: Readonly<{
  busyId?: string;
  error?: unknown;
  feedback?: { tone: 'danger' | 'success'; message: string };
  onArchive(post: ManagedPost): void;
  onCreate(): void;
  onEdit(post: ManagedPost): void;
  onPublish(post: ManagedPost): void;
  onRetry(): void;
  onSchedule(post: ManagedPost, instant: string): void;
  posts: readonly ManagedPost[];
  status: 'loading' | 'error' | 'success';
}>) {
  const [panel, setPanel] = useState<Panel>();

  if (status !== 'success')
    return (
      <StatePage
        eyebrow="ARWEG · Administrativo"
        fallback="/admin"
        kind="back"
        title="Meus posts"
      >
        {status === 'loading' ? (
          <LoadingState message="Carregando posts..." />
        ) : (
          <ErrorState error={error} onRetry={onRetry} />
        )}
      </StatePage>
    );

  if (panel?.kind === 'schedule')
    return (
      <AdminPage fallback="/admin/posts" title="Agendar post">
        <Heading
          title={panel.post.title}
          subtitle="Escolha quando o post aparece no feed."
        />
        <SchedulePanel
          onCancel={() => setPanel(undefined)}
          onConfirm={(instant) => {
            onSchedule(panel.post, instant);
            setPanel(undefined);
          }}
          title="Agendar publicação"
        />
      </AdminPage>
    );

  return (
    <AdminPage title="Meus posts">
      <Heading
        title="Meus posts"
        subtitle="Edite rascunhos, agende ou publique, e arquive o que já saiu do ar."
      />
      <PrimaryButton label="+ Criar post" onPress={onCreate} />
      {feedback ? (
        <Notice tone={feedback.tone}>{feedback.message}</Notice>
      ) : null}
      {posts.length === 0 ? (
        <Card>
          <Text style={styles.empty}>
            Você ainda não criou posts. Toque em + Criar post para começar.
          </Text>
        </Card>
      ) : (
        posts.map((post) => {
          const tone = tones[post.status];
          const busy = busyId === post.id;
          const confirmingArchive =
            panel?.kind === 'archive' && panel.post.id === post.id;
          return (
            <Card key={post.id}>
              <View style={styles.head}>
                <Text style={styles.title}>{post.title}</Text>
                <StatusChip
                  background={tone?.background}
                  color={tone?.color}
                  label={postStatusLabels[post.status]}
                />
              </View>
              <Text numberOfLines={2} style={styles.body}>
                {post.content}
              </Text>
              {post.status === 'SCHEDULED' && post.scheduledAt ? (
                <Text style={styles.meta}>
                  Sai no feed em {formatScheduled(post.scheduledAt)}
                </Text>
              ) : null}

              {confirmingArchive ? (
                <View style={styles.confirm}>
                  <Notice tone="danger">
                    Arquivar este post? Ele sai do feed e não pode ser publicado
                    de novo.
                  </Notice>
                  <DangerButton
                    busy={busy}
                    label="Confirmar arquivamento"
                    onPress={() => {
                      setPanel(undefined);
                      onArchive(post);
                    }}
                  />
                  <LinkButton
                    label="Manter publicado"
                    onPress={() => setPanel(undefined)}
                  />
                </View>
              ) : (
                <View style={styles.actions}>
                  {post.status === 'DRAFT' || post.status === 'SCHEDULED' ? (
                    <>
                      <PrimaryButton
                        busy={busy}
                        label="Publicar agora"
                        onPress={() => onPublish(post)}
                      />
                      <SecondaryButton
                        disabled={busy}
                        label="Editar"
                        onPress={() => onEdit(post)}
                      />
                    </>
                  ) : null}
                  {post.status === 'DRAFT' ? (
                    <SecondaryButton
                      disabled={busy}
                      label="Agendar"
                      onPress={() => setPanel({ kind: 'schedule', post })}
                    />
                  ) : null}
                  {post.status === 'PUBLISHED' ? (
                    <SecondaryButton
                      disabled={busy}
                      label="Arquivar"
                      onPress={() => setPanel({ kind: 'archive', post })}
                    />
                  ) : null}
                </View>
              )}
            </Card>
          );
        })
      )}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  head: {
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
  body: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  meta: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
  },
  actions: { gap: spacing.xs },
  confirm: { gap: spacing.xs },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
  },
});
