import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ThemeOption } from '@/preferences/domain';
import { EmptyState, ErrorState, LoadingState } from '@/shared/presentation';
import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

type Props = Readonly<{
  status: 'loading' | 'error' | 'success';
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
        onRetry={onRetry}
      />
    );
  if (themes.length === 0)
    return (
      <EmptyState
        message="Tente novamente mais tarde."
        title="Nenhum tema disponível"
      />
    );

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit([...selectedIds]);
    } catch {
      setSaveError('Não foi possível salvar suas preferências.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.page}>
      <FlatList
        testID="preferences-list"
        contentContainerStyle={styles.content}
        data={themes}
        keyExtractor={(theme) => theme.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const selected = selectedIds.has(item.id);
          return (
            <Pressable
              accessibilityLabel={item.name}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => onToggle(item.id)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.optionDescription}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={styles.selectionMark}
              >
                {selected ? '✓' : '○'}
              </Text>
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
          accessibilityState={{ busy: saving, disabled: saving }}
          disabled={saving}
          onPress={submit}
          style={[styles.button, saving && styles.buttonDisabled]}
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
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    minHeight: 64,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  optionDescription: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    marginTop: spacing.xxs,
  },
  selectionMark: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontSize: sizes.icon,
    marginLeft: spacing.sm,
  },
  footer: {
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
    paddingHorizontal: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
});
