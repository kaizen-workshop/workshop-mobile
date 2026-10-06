import { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
} from 'lucide-react-native';
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

export function ResetPasswordScreen({
  onBack,
  onSubmit,
}: {
  onBack?: () => void;
  onSubmit(input: { code: string; password: string }): Promise<void> | void;
}) {
  const { height: viewportHeight } = useWindowDimensions();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
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
            Confirme o código
          </Text>
          <Text style={styles.description}>
            Informe o código recebido e escolha sua nova senha.
          </Text>
          <Text style={styles.label}>Código de recuperação</Text>
          <View style={styles.field}>
            <KeyRound color={colors.textMuted} size={20} />
            <TextInput
              accessibilityLabel="Token de recuperação"
              autoCapitalize="none"
              onChangeText={setCode}
              placeholder="Cole o código recebido"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={code}
            />
          </View>
          <Text style={styles.label}>Nova senha</Text>
          <View style={styles.field}>
            <LockKeyhole color={colors.textMuted} size={20} />
            <TextInput
              accessibilityLabel="Nova senha"
              onChangeText={setPassword}
              placeholder="Digite sua nova senha"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!visible}
              style={styles.input}
              value={password}
            />
            <Pressable
              accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
              accessibilityRole="button"
              onPress={() => setVisible((current) => !current)}
              style={styles.visibilityButton}
            >
              {visible ? (
                <EyeOff color={colors.textMuted} size={20} />
              ) : (
                <Eye color={colors.textMuted} size={20} />
              )}
            </Pressable>
          </View>
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
            {loading ? <ActivityIndicator color={colors.onBrand} /> : null}
            <Text style={styles.buttonText}>
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
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
  visibilityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
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
  buttonDisabled: { opacity: 0.65 },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
  },
  footer: {
    color: colors.onBrand,
    fontSize: typography.caption,
    marginTop: spacing.xxl,
  },
});
