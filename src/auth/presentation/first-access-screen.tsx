import { Image } from 'expo-image';
import { KeyRound, LockKeyhole, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { describeError } from '@/core/errors';
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

import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

type Props = Readonly<{
  onRequestCode(login: string): Promise<void> | void;
  onSubmit(input: { code: string; password: string }): Promise<void> | void;
  onBack?: () => void;
}>;

export function FirstAccessScreen({ onBack, onRequestCode, onSubmit }: Props) {
  const { height: viewportHeight } = useWindowDimensions();
  const [login, setLogin] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = async () => {
    if (sendingCode || !login.trim()) {
      if (!login.trim()) setError('Informe o e-mail vinculado à sua conta.');
      return;
    }
    setSendingCode(true);
    setError(null);
    try {
      await onRequestCode(login.trim());
      setCodeSent(true);
    } catch (cause) {
      setError(
        describeError(cause, {
          not_found: 'Não encontramos uma conta com este e-mail.',
          bad_request: 'Informe um e-mail válido.',
        }).message,
      );
    } finally {
      setSendingCode(false);
    }
  };

  const submit = async () => {
    if (submitting) return;
    if (!code.trim() || !password) {
      setError('Informe o código recebido e a nova senha.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ code: code.trim(), password });
    } catch (cause) {
      setError(
        describeError(cause, {
          bad_request:
            'Código inválido ou expirado, ou senha fora do padrão. Confira os dados.',
          not_found: 'Código inválido ou expirado. Peça um novo código.',
        }).message,
      );
    } finally {
      setSubmitting(false);
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
        <Image
          accessibilityLabel="WEG"
          contentFit="contain"
          source={require('../../../assets/images/logo-weg.png')}
          style={styles.logo}
        />
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            Primeiro acesso
          </Text>
          <Text style={styles.description}>
            Solicite o código enviado por e-mail e defina sua senha de acesso.
          </Text>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.field}>
            <Mail color={colors.textMuted} size={20} />
            <TextInput
              accessibilityLabel="E-mail"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setLogin}
              placeholder="email@empresa.com"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              value={login}
            />
          </View>

          <Pressable
            accessibilityLabel="Enviar código"
            accessibilityRole="button"
            accessibilityState={{
              busy: sendingCode,
              disabled: sendingCode,
            }}
            disabled={sendingCode}
            onPress={() => void requestCode()}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.sendButtonText}>
              {sendingCode
                ? 'Enviando código...'
                : codeSent
                  ? 'Reenviar código'
                  : 'Enviar código'}
            </Text>
          </Pressable>

          <Text style={styles.label}>Código</Text>
          <View style={styles.field}>
            <KeyRound color={colors.textMuted} size={20} />
            <TextInput
              accessibilityLabel="Código"
              autoCapitalize="none"
              onChangeText={setCode}
              placeholder="Código recebido"
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
              autoComplete="new-password"
              onChangeText={setPassword}
              placeholder="Defina uma senha"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          <Text style={styles.label}>Confirme a senha</Text>
          <View style={styles.field}>
            <LockKeyhole color={colors.textMuted} size={20} />
            <TextInput
              accessibilityLabel="Confirmar nova senha"
              autoComplete="new-password"
              onChangeText={setConfirmPassword}
              onSubmitEditing={() => void submit()}
              placeholder="Repita a senha"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
            />
          </View>

          {codeSent ? (
            <Text accessibilityLiveRegion="polite" style={styles.success}>
              Se existir uma conta para este e-mail, enviamos um código. Confira
              a caixa de entrada e o spam. Ele vale por 1 hora.
            </Text>
          ) : null}
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityLabel="Concluir primeiro acesso"
            accessibilityRole="button"
            accessibilityState={{ busy: submitting, disabled: submitting }}
            disabled={submitting}
            onPress={() => void submit()}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              submitting && styles.buttonDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.onBrand} size="small" />
            ) : null}
            <Text style={styles.buttonText}>
              {submitting ? 'Concluindo...' : 'Concluir primeiro acesso'}
            </Text>
          </Pressable>

          {onBack ? (
            <Pressable
              accessibilityRole="link"
              onPress={onBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.backText}>Voltar ao login</Text>
            </Pressable>
          ) : null}
        </View>
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
  logo: { height: 60, marginBottom: spacing.lg, width: 92 },
  card: {
    ...shadows.floating,
    backgroundColor: colors.surface,
    borderRadius: radii.xxxl,
    maxWidth: sizes.formMaxWidth,
    padding: spacing.lg,
    width: '100%',
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
    fontSize: typography.bodySmall,
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
    paddingLeft: spacing.md,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyRegular,
    minHeight: 52,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.xl,
    justifyContent: 'center',
    marginTop: spacing.xs,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  sendButtonText: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.bodySmall,
    fontWeight: typography.bold,
  },
  success: {
    color: colors.positive,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    marginTop: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    marginTop: spacing.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 54,
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: { opacity: 0.68 },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: sizes.touchTarget,
  },
  backText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
  },
  pressed: { opacity: 0.7 },
});
