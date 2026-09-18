import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

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
    <View>
      <Text>Redefinir senha</Text>
      <TextInput
        accessibilityLabel="Código"
        value={code}
        onChangeText={setCode}
      />
      <TextInput
        accessibilityLabel="Nova senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Redefinir senha"
        disabled={loading}
        onPress={submit}
      >
        <Text>{loading ? 'Redefinindo...' : 'Redefinir senha'}</Text>
      </Pressable>
    </View>
  );
}
