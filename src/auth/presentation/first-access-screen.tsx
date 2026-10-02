import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

export function FirstAccessScreen({
  onSubmit,
}: {
  onSubmit(code: string): Promise<void> | void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(code);
    } catch {
      setError('Não foi possível validar o código.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.logo}>WEG</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Entrar
      </Text>
      <Text style={styles.label}>Código</Text>
      <TextInput
        accessibilityLabel="Código"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="123456"
        placeholderTextColor={colors.placeholder}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable
        accessibilityState={{ busy: loading, disabled: loading }}
        accessibilityRole="button"
        accessibilityLabel="Enviar"
        disabled={loading}
        onPress={submit}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Enviando...' : 'Enviar'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  logo: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.logo,
    fontWeight: typography.heavy,
    textAlign: 'center',
  },
  title: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
    textAlign: 'center',
    marginVertical: spacing.xxl,
  },
  label: {
    color: colors.onBrand,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: typography.familyRegular,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  button: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  buttonText: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
  error: {
    color: colors.onBrand,
    fontFamily: typography.familyRegular,
    marginTop: spacing.sm,
  },
});
