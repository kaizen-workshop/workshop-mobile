import { Stack } from 'expo-router';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  useFonts,
} from '@expo-google-fonts/roboto';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { createAuthGateway } from '@/auth/data/auth-gateway-factory';
import { AuthProvider, useAuth } from '@/auth/session';
import { createTokenStorage } from '@/core/secure-storage';
import { colors } from '@/shared/theme';

const variant = __DEV__ ? 'development' : 'production';
const gateway = createAuthGateway(
  process.env.APP_AUTH_MODE === 'demo' ? 'demo' : 'api',
  variant,
);
const tokenStorage = createTokenStorage();

function SessionRoutes() {
  const { isRestoring, state } = useAuth();

  if (isRestoring) {
    return (
      <View
        accessibilityLabel="Restaurando sessão"
        accessibilityRole="progressbar"
        style={styles.loading}
      >
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={state === 'UNAUTHENTICATED'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={state === 'REQUIRES_PASSWORD_CHANGE'}>
        <Stack.Screen name="(password-change)" />
      </Stack.Protected>
      <Stack.Protected guard={state === 'REQUIRES_ONBOARDING'}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={state === 'AUTHENTICATED'}>
        <Stack.Screen name="(authenticated)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View
        accessibilityLabel="Carregando identidade visual"
        accessibilityRole="progressbar"
        style={styles.loading}
      >
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <AuthProvider gateway={gateway} tokenStorage={tokenStorage}>
      <SessionRoutes />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
});
