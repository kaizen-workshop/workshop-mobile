import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

type Props = Readonly<{
  onSubmit(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> | void;
}>;

export function ChangePasswordScreen({ onSubmit }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (loading) return;
    if (!currentPassword || !newPassword) {
      setError('Preencha a senha atual e a nova senha.');
      return;
    }
    if (newPassword !== confirmation) {
      setError('A confirmação deve ser igual à nova senha.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch {
      setError('Não foi possível alterar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          Crie uma nova senha
        </Text>
        <Text style={styles.description}>
          Para continuar, substitua a senha temporária da sua conta.
        </Text>

        <Text style={styles.label}>Senha atual</Text>
        <TextInput
          accessibilityLabel="Senha atual"
          autoCapitalize="none"
          onChangeText={setCurrentPassword}
          secureTextEntry
          style={styles.input}
          value={currentPassword}
        />

        <Text style={styles.label}>Nova senha</Text>
        <TextInput
          accessibilityLabel="Nova senha"
          autoCapitalize="none"
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
          value={newPassword}
        />

        <Text style={styles.label}>Confirmar nova senha</Text>
        <TextInput
          accessibilityLabel="Confirmar nova senha"
          autoCapitalize="none"
          onChangeText={setConfirmation}
          secureTextEntry
          style={styles.input}
          value={confirmation}
        />

        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityLabel="Alterar senha"
          accessibilityRole="button"
          disabled={loading}
          onPress={submit}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Alterando...' : 'Alterar senha'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.brand,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 21,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.familyRegular,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.familyRegular,
    marginTop: spacing.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    marginTop: spacing.lg,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
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
