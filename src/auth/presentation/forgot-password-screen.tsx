import React from 'react';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export function ForgotPasswordScreen({
  onSubmit,
}: {
  onSubmit(login: string): Promise<void> | void;
}) {
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
    <View>
      <Text>Recuperar senha</Text>
      <TextInput
        accessibilityLabel="Usuário ou e-mail"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
      />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enviar código"
        disabled={loading}
        onPress={submit}
      >
        <Text>{loading ? 'Enviando...' : 'Enviar código'}</Text>
      </Pressable>
    </View>
  );
}
