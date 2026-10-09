import { describeError } from '@/core/errors';
import { useState } from 'react';
import { Check } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ThemeOption } from '@/preferences/domain';
import { coverFor } from '@/workshop/presentation/workshop-cover';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from '@/shared/presentation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  themes: readonly ThemeOption[];
  selectedIds: ReadonlySet<string>;
  onToggle(themeId: string): void;
  onRetry?: () => void;
  onSubmit(themeIds: readonly string[]): Promise<void> | void;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
}>;

export function PreferencesScreen({
  onRetry,
  onSubmit,
  onToggle,
  selectedIds,
  status,
  error,
  submitLabel = 'Continuar',
  subtitle = 'Selecione um ou mais temas para personalizar seu feed.',
  themes,
  title = 'Escolha seus interesses',
}: Props) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (status === 'loading') return <LoadingState message="Carregando temas" />;
  if (status === 'error')
    return (
      <ErrorState
        message="Não foi possível carregar os temas."
        error={error}
        onRetry={onRetry}
      />
    );
  if (themes.length === 0)
    return (
      <EmptyState
        actionLabel="Atualizar temas"
        message="Tente novamente mais tarde."
        onAction={onRetry}
        title="Nenhum tema disponível"
      />
    );

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit([...selectedIds]);
    } catch (cause) {
      setSaveError(
        describeError(cause, {
          unknown: 'Não foi possível salvar suas preferências.',
        }).message,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.page}>
      <FlatList
        testID="preferences-list"
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        data={themes}
        numColumns={2}
        keyExtractor={(theme) => theme.id}
        ListHeaderComponent={
          <View>
            <PageHeader
              description={subtitle}
              eyebrow="Personalize sua experiência"
              title={title}
            />
            <View style={styles.selectionSummary}>
              <Text style={styles.selectionSummaryText}>
                {selectedIds.size === 0
                  ? 'Selecione pelo menos um tema'
                  : `${selectedIds.size} ${selectedIds.size === 1 ? 'tema selecionado' : 'temas selecionados'}`}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const selected = selectedIds.has(item.id);
          const { Icon } = coverFor(item.name, item.name);
          return (
            <Pressable
              accessibilityLabel={item.name}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => onToggle(item.id)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={styles.optionTop}>
                <Icon
                  color={selected ? colors.brand : colors.textMuted}
                  size={24}
                />
                {selected ? (
                  <Check color={colors.brand} size={18} strokeWidth={3} />
                ) : null}
              </View>
              <Text style={styles.optionTitle}>{item.name}</Text>
              {item.description ? (
                <Text numberOfLines={2} style={styles.optionDescription}>
                  {item.description}
                </Text>
              ) : null}
            </Pressable>
          );
        }}
      />
      <View style={styles.footer}>
        {saveError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {saveError}
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel={submitLabel}
          accessibilityRole="button"
          accessibilityState={{
            busy: saving,
            disabled: saving || selectedIds.size === 0,
          }}
          disabled={saving || selectedIds.size === 0}
          onPress={submit}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            (saving || selectedIds.size === 0) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Salvando...' : submitLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  selectionSummary: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectionSummaryText: {
    color: colors.brandStrong,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  row: { gap: spacing.sm },
  option: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.surface3,
    borderRadius: radii.xl,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xxs,
    marginBottom: spacing.sm,
    minHeight: 112,
    padding: spacing.md,
  },
  optionTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  optionSelected: {
    backgroundColor: colors.brandSubtle,
    borderColor: colors.brand,
    borderWidth: 2,
  },
  optionPressed: { opacity: 0.7 },
  optionTitle: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  optionDescription: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    lineHeight: 16,
  },
  footer: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.md,
  },
  error: {
    color: colors.text,
    fontFamily: typography.familyRegular,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    maxWidth: sizes.contentMaxWidth,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
});
