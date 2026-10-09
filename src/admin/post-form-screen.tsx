import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import {
  AdminPage,
  Card,
  Field,
  Heading,
  LinkButton,
  Notice,
  PrimaryButton,
  SecondaryButton,
} from './admin-ui';
import { colors, spacing, typography } from '@/shared/theme';

export type PostFormValues = {
  title: string;
  content: string;
  highlight: boolean;
};

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>;

export function validatePost(values: PostFormValues): PostFormErrors {
  const errors: PostFormErrors = {};
  if (!values.title.trim()) errors.title = 'Preencha este campo.';
  else if (values.title.trim().length > 180)
    errors.title = 'Use no máximo 180 caracteres.';
  if (!values.content.trim())
    errors.content = 'Escreva o conteúdo da postagem.';
  else if (values.content.trim().length > 10000)
    errors.content = 'Use no máximo 10.000 caracteres.';
  return errors;
}

export function PostFormScreen({
  busy,
  feedback,
  onCancel,
  onSave,
}: Readonly<{
  busy: boolean;
  feedback?: { tone: 'danger' | 'success'; message: string };
  onCancel(): void;
  /** `publish` also publishes right after saving the draft. */
  onSave(values: PostFormValues, publish: boolean): void;
}>) {
  const [values, setValues] = useState<PostFormValues>({
    title: '',
    content: '',
    highlight: false,
  });
  const [errors, setErrors] = useState<PostFormErrors>({});

  const submit = (publish: boolean) => {
    const found = validatePost(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave(values, publish);
  };

  return (
    <AdminPage title="Criar post">
      <Heading
        title="Novo post"
        subtitle="Preencha os dados para criar a publicação."
      />
      <Card>
        <Field
          error={errors.title}
          label="Título da postagem"
          maxLength={180}
          onChangeText={(title) => {
            setValues((v) => ({ ...v, title }));
            setErrors((e) => ({ ...e, title: undefined }));
          }}
          placeholder="Ex.: Conheça nossos workshops"
          value={values.title}
        />
        <Field
          error={errors.content}
          label="Conteúdo"
          multiline
          onChangeText={(content) => {
            setValues((v) => ({ ...v, content }));
            setErrors((e) => ({ ...e, content: undefined }));
          }}
          placeholder="Escreva a mensagem que será exibida no feed"
          value={values.content}
        />
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: values.highlight }}
          onPress={() => setValues((v) => ({ ...v, highlight: !v.highlight }))}
          style={styles.switchRow}
        >
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Destacar no feed</Text>
            <Text style={styles.switchHint}>
              Posts em destaque aparecem com uma etiqueta para os participantes.
            </Text>
          </View>
          <Switch
            onValueChange={(highlight) =>
              setValues((v) => ({ ...v, highlight }))
            }
            thumbColor={colors.surface}
            trackColor={{ false: colors.border, true: colors.brand }}
            value={values.highlight}
          />
        </Pressable>
      </Card>

      {feedback ? (
        <Notice tone={feedback.tone}>{feedback.message}</Notice>
      ) : null}

      <PrimaryButton
        busy={busy}
        label="Publicar agora"
        onPress={() => submit(true)}
      />
      <SecondaryButton
        disabled={busy}
        label="Salvar rascunho"
        onPress={() => submit(false)}
      />
      <LinkButton label="Voltar" onPress={onCancel} />
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
  },
  switchText: { flex: 1 },
  switchLabel: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  switchHint: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
