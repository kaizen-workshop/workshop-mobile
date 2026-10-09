import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { PostComment } from '@/feed/domain/post-comment';
import { BackHeader, StatePage } from '@/navigation';
import { useKeyboardVisible } from '@/shared/hooks';
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
export function CommentsScreen({
  items,
  currentUserId,
  status,
  error,
  postTitle,
  sending,
  sendError,
  actionError,
  loadingMore,
  onRetry,
  onLoadMore,
  onSend,
  onEdit,
  onDelete,
}: {
  items: readonly PostComment[];
  currentUserId: string;
  status: 'loading' | 'error' | 'success';
  /** Title of the post being discussed, shown for context. */
  postTitle?: string;
  error?: unknown;
  sending: boolean;
  sendError: boolean | string;
  actionError: boolean | string;
  loadingMore: boolean;
  onRetry(): void;
  onLoadMore?: () => void;
  onSend(content: string): Promise<boolean> | boolean;
  onEdit(comment: PostComment, content: string): Promise<boolean> | boolean;
  onDelete(comment: PostComment): Promise<void> | void;
}) {
  const keyboardVisible = useKeyboardVisible();
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string>();
  const [editContent, setEditContent] = useState('');
  const [actingId, setActingId] = useState<string>();
  const frame = (node: React.ReactNode) => (
    <StatePage kind="back" eyebrow={'Conversa'} title={'Comentários'}>
      {node}
    </StatePage>
  );
  if (status === 'loading')
    return frame(<LoadingState message="Carregando comentários..." />);
  if (status === 'error')
    return frame(<ErrorState error={error} onRetry={onRetry} />);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.page}
    >
      {keyboardVisible ? null : (
        <View style={styles.header}>
          <BackHeader eyebrow="Conversa" title="Comentários" />
          {postTitle ? (
            <View style={styles.postContext}>
              <Text style={styles.postContextLabel}>Sobre o post</Text>
              <Text numberOfLines={2} style={styles.postContextTitle}>
                {postTitle}
              </Text>
            </View>
          ) : null}
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={items.length ? styles.list : styles.empty}
        ListEmptyComponent={
          <EmptyState message="Seja a primeira pessoa a comentar." />
        }
        ListFooterComponent={
          loadingMore ? (
            <Text style={styles.loadingMore}>Carregando mais...</Text>
          ) : null
        }
        onEndReached={onLoadMore}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <View style={styles.commentHeader}>
              <View style={styles.avatar}>
                <AppSymbol
                  color={colors.brand}
                  fallback="•"
                  name={{
                    ios: 'person.fill',
                    android: 'person',
                    web: 'person',
                  }}
                  size={18}
                />
              </View>
              <Text style={styles.commentOwner}>
                {item.userId === currentUserId ? 'Você' : 'Participante'}
              </Text>
            </View>
            {editingId === item.id ? (
              <TextInput
                accessibilityLabel="Editar comentário"
                editable={actingId !== item.id}
                maxLength={4000}
                onChangeText={setEditContent}
                style={styles.input}
                value={editContent}
              />
            ) : (
              <Text style={styles.body}>{item.content}</Text>
            )}
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString('pt-BR')}
            </Text>
            {item.userId === currentUserId ? (
              <View style={styles.actions}>
                {editingId === item.id ? (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      disabled={actingId === item.id || !editContent.trim()}
                      onPress={async () => {
                        setActingId(item.id);
                        try {
                          if (await onEdit(item, editContent)) {
                            setEditingId(undefined);
                            setEditContent('');
                          }
                        } finally {
                          setActingId(undefined);
                        }
                      }}
                      style={styles.actionButton}
                    >
                      <Text style={styles.action}>Salvar</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={actingId === item.id}
                      onPress={() => setEditingId(undefined)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.action}>Cancelar</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setEditingId(item.id);
                        setEditContent(item.content);
                      }}
                      style={styles.actionButton}
                    >
                      <Text style={styles.action}>Editar</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={actingId === item.id}
                      onPress={async () => {
                        setActingId(item.id);
                        try {
                          await onDelete(item);
                        } finally {
                          setActingId(undefined);
                        }
                      }}
                      style={styles.actionButton}
                    >
                      <Text style={styles.delete}>Excluir</Text>
                    </Pressable>
                  </>
                )}
              </View>
            ) : null}
          </View>
        )}
      />
      <View style={styles.feedback}>
        {sendError ? (
          <InlineNotice
            tone="warning"
            message={
              typeof sendError === 'string'
                ? sendError
                : 'Não foi possível publicar o comentário.'
            }
          />
        ) : null}
        {actionError ? (
          <InlineNotice
            tone="warning"
            message={
              typeof actionError === 'string'
                ? actionError
                : 'Não foi possível alterar o comentário.'
            }
          />
        ) : null}
      </View>
      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Novo comentário"
          value={content}
          onChangeText={setContent}
          maxLength={4000}
          multiline
          placeholder="Escreva um comentário"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            busy: sending,
            disabled: sending || !content.trim(),
          }}
          disabled={sending || !content.trim()}
          onPress={async () => {
            if (await onSend(content)) setContent('');
          }}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            (sending || !content.trim()) && styles.buttonDisabled,
          ]}
        >
          <AppSymbol
            color={colors.onBrand}
            fallback="→"
            name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
            size={18}
          />
          <Text style={styles.buttonText}>
            {sending ? 'Publicando...' : 'Publicar'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  postContext: {
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  postContextLabel: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
    textTransform: 'uppercase',
  },
  postContextTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  page: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    width: '100%',
    maxWidth: sizes.contentMaxWidth,
  },
  list: {
    alignSelf: 'center',
    gap: spacing.sm,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  empty: { flexGrow: 1 },
  comment: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.card,
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  commentOwner: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  body: {
    color: colors.text,
    fontFamily: typography.familyRegular,
    lineHeight: 22,
  },
  date: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  actionButton: {
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.xs,
  },
  action: { color: colors.brand, fontFamily: typography.familyMedium },
  delete: { color: colors.danger, fontFamily: typography.familyMedium },
  loadingMore: { color: colors.textMuted, padding: spacing.md },
  feedback: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    width: '100%',
    maxWidth: sizes.contentMaxWidth,
  },
  composer: {
    alignItems: 'flex-end',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
    width: '100%',
    maxWidth: sizes.contentMaxWidth,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    maxHeight: 120,
    minHeight: sizes.touchTarget,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    textAlignVertical: 'top',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: { opacity: 0.55 },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
});
