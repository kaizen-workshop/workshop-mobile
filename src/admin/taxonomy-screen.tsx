import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Taxonomy } from './admin';
import {
  AdminPage,
  Card,
  Field,
  Heading,
  Notice,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
} from './admin-ui';
import { colors, spacing, typography } from '@/shared/theme';

export type TaxonomyKind = 'themes' | 'categories';

const labels: Record<TaxonomyKind, { plural: string; singular: string }> = {
  categories: { plural: 'Categorias', singular: 'categoria' },
  themes: { plural: 'Temas', singular: 'tema' },
};

export function TaxonomyScreen({
  busyId,
  categories,
  feedback,
  onCreate,
  onDeactivate,
  themes,
}: Readonly<{
  busyId?: string;
  categories: readonly Taxonomy[];
  feedback?: { tone: 'danger' | 'success'; message: string };
  onCreate(kind: TaxonomyKind, name: string): Promise<boolean> | boolean;
  onDeactivate(kind: TaxonomyKind, item: Taxonomy): void;
  themes: readonly Taxonomy[];
}>) {
  return (
    <AdminPage title="Categorias e temas">
      <Heading
        title="Categorias e temas"
        subtitle="Organize como os workshops são classificados e como os participantes escolhem interesses."
      />
      {feedback ? (
        <Notice tone={feedback.tone}>{feedback.message}</Notice>
      ) : null}
      <Section
        busyId={busyId}
        items={categories}
        kind="categories"
        onCreate={onCreate}
        onDeactivate={onDeactivate}
      />
      <Section
        busyId={busyId}
        items={themes}
        kind="themes"
        onCreate={onCreate}
        onDeactivate={onDeactivate}
      />
    </AdminPage>
  );
}

function Section({
  busyId,
  items,
  kind,
  onCreate,
  onDeactivate,
}: Readonly<{
  busyId?: string;
  items: readonly Taxonomy[];
  kind: TaxonomyKind;
  onCreate(kind: TaxonomyKind, name: string): Promise<boolean> | boolean;
  onDeactivate(kind: TaxonomyKind, item: Taxonomy): void;
}>) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Taxonomy>();
  const label = labels[kind];

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError(`Informe o nome da ${label.singular}.`);
    if (trimmed.length > 120) return setError('Use no máximo 120 caracteres.');
    if (items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase()))
      return setError(
        `Já existe ${label.singular === 'tema' ? 'um tema' : 'uma categoria'} com este nome.`,
      );
    setSaving(true);
    try {
      if (await onCreate(kind, trimmed)) setName('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <SectionTitle>{label.plural}</SectionTitle>
      {items.length === 0 ? (
        <Text style={styles.empty}>Nenhum item ativo.</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.action}>
              <SecondaryButton
                busy={busyId === item.id}
                label="Desativar"
                onPress={() => setPending(item)}
              />
            </View>
          </View>
        ))
      )}
      {pending ? (
        <View style={styles.confirm}>
          <Notice tone="danger">
            {`Desativar "${pending.name}"? Ele deixa de aparecer para novos workshops e escolhas. Esta ação não pode ser desfeita aqui.`}
          </Notice>
          <PrimaryButton
            label="Confirmar desativação"
            onPress={() => {
              onDeactivate(kind, pending);
              setPending(undefined);
            }}
          />
          <SecondaryButton
            label="Manter ativo"
            onPress={() => setPending(undefined)}
          />
        </View>
      ) : null}
      <Field
        error={error}
        hint="Itens desativados deixam de aparecer para novos workshops e escolhas."
        label={`Nome da ${label.singular}`}
        maxLength={120}
        onChangeText={(value) => {
          setName(value);
          setError(undefined);
        }}
        placeholder={`Digite o nome da ${label.singular}`}
        value={name}
      />
      <PrimaryButton
        busy={saving}
        label={`Adicionar ${label.singular}`}
        onPress={() => void submit()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  confirm: { gap: spacing.xs },
  row: {
    alignItems: 'center',
    borderTopColor: colors.surface3,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  name: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  action: { minWidth: 120 },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
});
