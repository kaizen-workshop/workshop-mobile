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

export function ResetPasswordScreen({
  onSubmit,
}: {
  onSubmit(input: { code: string; password: string }): Promise<void> | void;
}) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ code, password });
      setCode('');
      setPassword('');
    } catch {
      setError('Não foi possível redefinir a senha.');
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
          Redefinir senha
        </Text>
        <Text style={styles.label}>Código</Text>
        <TextInput
          accessibilityLabel="Código"
          keyboardType="number-pad"
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          value={code}
        />
        <Text style={styles.label}>Nova senha</Text>
        <TextInput
          accessibilityLabel="Nova senha"
          onChangeText={setPassword}
          placeholder="Digite sua nova senha"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Pressable
          accessibilityState={{ busy: loading, disabled: loading }}
          accessibilityRole="button"
          accessibilityLabel="Redefinir senha"
          disabled={loading}
          onPress={submit}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
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
