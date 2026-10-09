import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ChatMessage } from './message';
import { BackHeader, StatePage } from '@/navigation';
import {
  AppSymbol,
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

const sendSymbol = {
  ios: 'paperplane.fill',
  android: 'send',
  web: 'send',
} as const;

export function ChatScreen({
  title,
  active,
  canSendMessages,
  canModerate,
  currentUserId,
  messages,
  status,
  error,
  sending,
  sendError,
  hasMore,
  onRetry,
  onLoadMore,
  onSend,
  onDelete,
}: {
  title: string;
  active: boolean;
  canSendMessages: boolean;
  canModerate: boolean;
  currentUserId: string;
  messages: readonly ChatMessage[];
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  sending: boolean;
  sendError?: boolean | string;
  hasMore: boolean;
  onRetry(): void;
  onLoadMore(): void;
  onSend(content: string): Promise<boolean> | boolean;
  onDelete(message: ChatMessage): void;
}) {
  const [content, setContent] = useState('');
  const frame = (node: React.ReactNode) => (
    <StatePage
      kind="back"
      eyebrow={'Grupo'}
      title={title}
      fallback={'/(authenticated)/groups'}
    >
      {node}
    </StatePage>
  );
  if (status === 'loading')
    return frame(<LoadingState message="Carregando mensagens..." />);
  if (status === 'error')
    return frame(
      <ErrorState
        error={error}
        overrides={{
          not_found: 'O grupo não está disponível ou foi encerrado.',
          forbidden: 'Seu acesso a este grupo foi removido.',
        }}
        onRetry={onRetry}
      />,
    );
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <BackHeader
          eyebrow={active ? 'Grupo ativo' : 'Histórico do grupo'}
          title={title}
        />
      </View>
      {!active ? (
        <View style={styles.notice}>
          <InlineNotice message="Este grupo foi encerrado. O histórico permanece disponível." />
        </View>
      ) : null}
      <FlatList
        inverted
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={messages.length ? styles.list : styles.empty}
        ListEmptyComponent={<EmptyState message="Ainda não há mensagens." />}
        onEndReached={hasMore ? onLoadMore : undefined}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.authorId === currentUserId && styles.own,
            ]}
          >
            <Text style={styles.author}>{item.authorName}</Text>
            <Text style={styles.body}>
              {item.deletedAt ? 'Mensagem excluída' : item.content}
            </Text>
            <Text style={styles.meta}>
              {formatTime(item.sentAt)}
              {item.editedAt && !item.deletedAt ? ' · editada' : ''}
            </Text>
            {(item.authorId === currentUserId || canModerate) &&
            !item.deletedAt &&
            active ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Excluir mensagem"
                onPress={() => onDelete(item)}
              >
                <Text style={styles.delete}>Excluir</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />
      {sendError ? (
        <View style={styles.notice}>
          <InlineNotice
            message={
              typeof sendError === 'string'
                ? sendError
                : 'Falha ao enviar. Verifique a conexão antes de tentar uma nova mensagem.'
            }
            tone="warning"
          />
        </View>
      ) : null}
      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Mensagem"
          editable={canSendMessages && !sending}
          value={content}
          onChangeText={setContent}
          multiline
          placeholder={
            canSendMessages ? 'Escreva uma mensagem' : 'Envio indisponível'
          }
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            busy: sending,
            disabled: sending || !canSendMessages || !content.trim(),
          }}
          disabled={sending || !canSendMessages || !content.trim()}
          onPress={async () => {
            const value = content;
            if (await onSend(value)) setContent('');
          }}
          style={({ pressed }) => [
            styles.send,
            pressed && styles.sendPressed,
            (sending || !canSendMessages || !content.trim()) &&
              styles.sendDisabled,
          ]}
        >
          <AppSymbol
            color={colors.onBrand}
            fallback="›"
            name={sendSymbol}
            size={21}
          />
          <Text style={styles.sendText}>{sending ? '...' : 'Enviar'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    width: '100%',
  },
  notice: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  list: {
    alignSelf: 'center',
    gap: spacing.sm,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.md,
    width: '100%',
  },
  empty: { flexGrow: 1 },
  message: {
    ...shadows.card,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.surface3,
    borderRadius: radii.xxl,
    borderWidth: 1,
    maxWidth: '86%',
    padding: spacing.md,
  },
  own: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brandSubtle,
    borderColor: colors.brandSoft,
  },
  author: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
  },
  body: {
    color: colors.text,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.xxs,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  delete: { color: colors.danger, marginTop: spacing.xs },
  composer: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.surface3,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    minHeight: sizes.touchTarget,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
  },
  send: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  sendPressed: { backgroundColor: colors.brandPressed },
  sendDisabled: { opacity: 0.55 },
  sendText: { color: colors.onBrand, fontFamily: typography.familyBold },
});
