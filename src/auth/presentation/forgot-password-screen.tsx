import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react-native';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

export function ForgotPasswordScreen({
  onBack,
  onSubmit,
}: {
  onBack?: () => void;
  onSubmit(login: string): Promise<void> | void;
}) {
  const { height: viewportHeight } = useWindowDimensions();
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
    <ImageBackground
      resizeMode="cover"
      source={require('../../../assets/images/background-login.webp')}
      style={[styles.background, { height: viewportHeight }]}
    >
      <View style={styles.overlay} />
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        {onBack ? (
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="link"
            onPress={onBack}
            style={styles.back}
          >
            <ArrowLeft color={colors.onBrand} size={24} />
          </Pressable>
        ) : null}
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            Informe o Email
          </Text>
          <Text style={styles.description}>
            Informe o e-mail vinculado à sua conta para receber as instruções de
            recuperação.
          </Text>
          <Text style={styles.label}>Usuário / Email</Text>
          <View style={styles.field}>
            <Mail color={colors.textMuted} size={20} />
            <TextInput
              accessibilityLabel="E-mail"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setLogin}
              placeholder="email@gmail.com"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={login}
            />
          </View>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Pressable
            accessibilityState={{ busy: loading, disabled: loading }}
            accessibilityRole="button"
            accessibilityLabel="Enviar recuperação"
            disabled={loading}
            onPress={submit}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            {loading ? <ActivityIndicator color={colors.onBrand} /> : null}
            <Text style={styles.buttonText}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>
          © 2026 WEG S.A. Todos os direitos reservados.
        </Text>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%' },
  overlay: {
    backgroundColor: 'rgba(0, 4, 35, 0.28)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  page: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  back: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: radii.full,
    height: sizes.touchTarget,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: sizes.touchTarget,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxxl,
    maxWidth: sizes.formMaxWidth,
    padding: spacing.xl,
    width: '100%',
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
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    marginBottom: spacing.xs,
  },
  field: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyRegular,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
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
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: sizes.touchTarget,
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: { opacity: 0.65 },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
  },
  footer: {
    color: colors.onBrand,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    marginTop: spacing.xxl,
  },
});
