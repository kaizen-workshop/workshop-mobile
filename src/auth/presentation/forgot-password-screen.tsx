import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

export function ForgotPasswordScreen({
  onSubmit,
}: {
  onSubmit(login: string): Promise<void> | void;
}) {
  const [login, setLogin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(login);
    } catch {
      setError('Não foi possível enviar o código.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          Recuperar senha
        </Text>
        <Text style={styles.description}>
          Informe seu usuário ou e-mail para receber o código de recuperação.
        </Text>
        <Text style={styles.label}>Usuário ou e-mail</Text>
        <TextInput
          accessibilityLabel="Usuário ou e-mail"
          autoCapitalize="none"
          onChangeText={setLogin}
          placeholder="email@exemplo.com"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          value={login}
        />
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Pressable
          accessibilityState={{ busy: loading, disabled: loading }}
          accessibilityRole="button"
          accessibilityLabel="Enviar código"
          disabled={loading}
          onPress={submit}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Enviando...' : 'Enviar código'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.brand,
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
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
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    lineHeight: 24,
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    marginBottom: spacing.xs,
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
    color: colors.text,
    fontFamily: typography.familyRegular,
    marginTop: spacing.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: sizes.touchTarget,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
  },
});
