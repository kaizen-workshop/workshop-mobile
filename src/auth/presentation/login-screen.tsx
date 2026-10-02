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

type Props = Readonly<{
  onSubmit(input: { login: string; password: string }): Promise<void> | void;
  onFirstAccess?: () => void;
  onForgotPassword?: () => void;
}>;

export function LoginScreen({
  onFirstAccess,
  onForgotPassword,
  onSubmit,
}: Props) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ login, password });
    } catch {
      setError('Não foi possível entrar. Tente novamente.');
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
          Entrar
        </Text>
        <Text style={styles.label}>Usuário / Email</Text>
        <TextInput
          accessibilityLabel="Usuário ou e-mail"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          style={styles.input}
          placeholder="email@gmail.com"
          placeholderTextColor={colors.placeholder}
        />
        <Text style={styles.label}>Senha</Text>
        <View style={styles.password}>
          <TextInput
            accessibilityLabel="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!visible}
            style={styles.passwordInput}
            placeholder="******"
            placeholderTextColor={colors.placeholder}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setVisible(!visible)}
            style={styles.visibilityButton}
          >
            <Text>◉</Text>
          </Pressable>
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        {onFirstAccess ? (
          <Pressable
            accessibilityRole="link"
            onPress={onFirstAccess}
            style={styles.link}
          >
            <Text style={styles.linkText}>Primeiro acesso</Text>
          </Pressable>
        ) : null}
        {onForgotPassword ? (
          <Pressable
            accessibilityRole="link"
            onPress={onForgotPassword}
            style={styles.link}
          >
            <Text style={styles.linkText}>Esqueci minha senha</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityState={{ busy: loading, disabled: loading }}
          accessibilityRole="button"
          accessibilityLabel="Entrar"
          disabled={loading}
          onPress={submit}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.brand,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: typography.familyRegular,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  password: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyRegular,
    paddingVertical: spacing.md,
  },
  visibilityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
  },
  button: {
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.brand,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
  error: {
    color: colors.text,
    fontFamily: typography.familyRegular,
    marginTop: spacing.sm,
  },
  link: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.sm,
  },
  linkText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
});
