import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
    <View style={styles.page}>
      <Text style={styles.logo}>WEG</Text>
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.label}>Código</Text>
      <TextInput
        accessibilityLabel="Código"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="123456"
      />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <Pressable
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
    </View>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
    backgroundColor: '#0963A8',
  },
  logo: { color: '#fff', fontSize: 34, fontWeight: '800', textAlign: 'center' },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 42,
  },
  label: { color: '#fff', fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14 },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: { color: '#0963A8', fontWeight: '700' },
});
