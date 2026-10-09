import { useState } from 'react';
import { Image } from 'expo-image';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
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

import { AppError, describeError } from '@/core/errors';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

type Props = Readonly<{
  onSubmit(input: { login: string; password: string }): Promise<void> | void;
  onForgotPassword?: () => void;
  onFirstAccess?: () => void;
}>;

export function LoginScreen({
  onFirstAccess,
  onForgotPassword,
  onSubmit,
}: Props) {
  const { height: viewportHeight } = useWindowDimensions();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'login' | 'password' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (loading) return;
    if (!login.trim() || !password) {
      setError('Preencha seu usuário ou e-mail e a senha.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ login: login.trim(), password });
    } catch (submitError) {
      logDevelopmentError(submitError);
      const invalid =
        'Usuário/e-mail ou senha inválidos. Confira os dados ou toque em "Esqueci minha senha".';
      setError(
        describeError(submitError, {
          unauthorized: invalid,
          forbidden: invalid,
          bad_request: 'Informe um usuário ou e-mail e a senha válidos.',
        }).message,
      );
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
        <View style={styles.content}>
          <Image
            accessibilityLabel="WEG"
            contentFit="contain"
            source={require('../../../assets/images/logo-weg.png')}
            style={styles.logo}
          />

          <View style={styles.card}>
            <View style={styles.heading}>
              <Text accessibilityRole="header" style={styles.title}>
                Entrar
              </Text>
              <Text style={styles.subtitle}>
                Acesse workshops, conteúdos e atividades da sua jornada.
              </Text>
            </View>

            <Text style={styles.label}>Usuário ou e-mail</Text>
            <View
              style={[styles.field, focused === 'login' && styles.fieldFocused]}
            >
              <Mail
                color={focused === 'login' ? colors.brand : colors.textMuted}
                size={20}
              />
              <TextInput
                accessibilityLabel="Usuário ou e-mail"
                autoCapitalize="none"
                autoComplete="username"
                onBlur={() => setFocused(null)}
                onChangeText={setLogin}
                onFocus={() => setFocused('login')}
                placeholder="seu usuário ou e-mail"
                placeholderTextColor={colors.placeholder}
                returnKeyType="next"
                style={styles.input}
                value={login}
              />
            </View>

            <Text style={styles.label}>Senha</Text>
            <View
              style={[
                styles.field,
                focused === 'password' && styles.fieldFocused,
              ]}
            >
              <LockKeyhole
                color={focused === 'password' ? colors.brand : colors.textMuted}
                size={20}
              />
              <TextInput
                accessibilityLabel="Senha"
                autoComplete="current-password"
                onBlur={() => setFocused(null)}
                onChangeText={setPassword}
                onFocus={() => setFocused('password')}
                onSubmitEditing={() => void submit()}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                secureTextEntry={!visible}
                style={styles.input}
                value={password}
              />
              <Pressable
                accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setVisible((current) => !current)}
                style={styles.visibilityButton}
              >
                {visible ? (
                  <EyeOff color={colors.textMuted} size={21} />
                ) : (
                  <Eye color={colors.textMuted} size={21} />
                )}
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              </View>
            ) : null}

            <View style={styles.links}>
              {onFirstAccess ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={onFirstAccess}
                  style={({ pressed }) => [
                    styles.link,
                    pressed && styles.linkPressed,
                  ]}
                >
                  <Text style={styles.linkText}>Primeiro acesso</Text>
                </Pressable>
              ) : null}
              {onForgotPassword ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={onForgotPassword}
                  style={({ pressed }) => [
                    styles.link,
                    pressed && styles.linkPressed,
                  ]}
                >
                  <Text style={styles.linkText}>Esqueci minha senha</Text>
                </Pressable>
              ) : null}
            </View>

            <Pressable
              accessibilityLabel="Entrar"
              accessibilityRole="button"
              accessibilityState={{ busy: loading, disabled: loading }}
              disabled={loading}
              onPress={() => void submit()}
              style={({ pressed }) => [
                styles.button,
                pressed && !loading && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.onBrand} size="small" />
              ) : null}
              <Text style={styles.buttonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            © 2026 WEG S.A. Todos os direitos reservados.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function logDevelopmentError(error: unknown) {
  if (!__DEV__) return;
  if (error instanceof AppError) {
    console.error('Authentication failed.', {
      category: error.category,
      status: error.status,
      code: error.code,
      technicalMessage: error.technicalMessage,
    });
    return;
  }
  console.error('Authentication failed.', {
    technicalMessage: error instanceof Error ? error.message : String(error),
  });
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
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingTop: spacing.xxl,
  },
  content: {
    alignItems: 'center',
    boxSizing: 'border-box',
    maxWidth: sizes.formMaxWidth,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  logo: {
    height: 67,
    marginBottom: spacing.xl,
    width: 100,
  },
  card: {
    ...shadows.floating,
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radii.xxxl,
    boxSizing: 'border-box',
    padding: spacing.lg,
    width: '100%',
  },
  heading: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  label: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  field: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    minHeight: 50,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  visibilityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.lg,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  error: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  links: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: spacing.sm,
  },
  link: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.sm,
  },
  linkPressed: {
    opacity: 0.65,
  },
  linkText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: {
    backgroundColor: colors.brandPressed,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  footer: {
    color: colors.onBrand,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    marginTop: spacing.xl,
    opacity: 0.9,
  },
});
