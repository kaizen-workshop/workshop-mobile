import React from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = Readonly<{
  onSubmit(input: { login: string; password: string }): Promise<void> | void;
}>;

export function LoginScreen({ onSubmit }: Props) {
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
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.label}>Usuário / Email</Text>
        <TextInput
          accessibilityLabel="Usuário ou e-mail"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          style={styles.input}
          placeholder="email@gmail.com"
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
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setVisible(!visible)}
          >
            <Text>◉</Text>
          </Pressable>
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Pressable
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
    </View>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#0963A8',
  },
  card: { padding: 20, borderRadius: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
  },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
  },
  password: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: { flex: 1, paddingVertical: 14 },
  button: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#0963A8',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#B91C1C', marginTop: 12 },
});
