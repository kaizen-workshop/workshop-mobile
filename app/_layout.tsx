import { useEffect } from 'react';
import { Stack } from 'expo-router';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { createAuthGateway } from '@/auth/data/auth-gateway-factory';
import { AuthProvider, useAuth } from '@/auth/session';
import { getAppVariant, getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient, createHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  createApiNotificationGateway,
  createPushDeviceStorage,
  unregisterPushDevice,
} from '@/notification/data';
import {
  installWebFocusStyle,
  installWebViewportFit,
  makeStyles,
  useTheme,
  ThemeProvider,
} from '@/shared/theme';

const variant = getAppVariant();
const authMode =
  process.env.EXPO_PUBLIC_APP_AUTH_MODE === 'demo' ? 'demo' : 'api';
const tokenStorage = createTokenStorage();
const environment = getEnvironment();
const gateway = createAuthGateway(
  authMode,
  variant,
  authMode === 'api'
    ? {
        http: createHttpClient(environment),
        tokenStorage,
      }
    : undefined,
);
const pushDeviceStorage = createPushDeviceStorage();
const notificationGateway = createApiNotificationGateway(
  createAuthenticatedHttpClient(environment, tokenStorage),
  tokenStorage,
);
const cleanupPushDevice = () =>
  unregisterPushDevice(notificationGateway, pushDeviceStorage);

function SessionRoutes() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isRestoring, state } = useAuth();

  if (isRestoring) {
    return (
      <View
        accessibilityLabel="Restaurando sessão"
        accessibilityRole="progressbar"
        style={styles.loading}
      >
        <ActivityIndicator color={colors.brandText} size="large" />
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

function RootContent() {
  const styles = useStyles();
  const { colors } = useTheme();
  useEffect(() => {
    installWebFocusStyle();
    installWebViewportFit();
  }, []);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View
        accessibilityLabel="Carregando identidade visual"
        accessibilityRole="progressbar"
        style={styles.loading}
      >
        <ActivityIndicator color={colors.brandText} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SafeAreaView
          edges={['top', 'right', 'bottom', 'left']}
          style={styles.safe}
        >
          <AuthProvider
            beforeLogout={cleanupPushDevice}
            gateway={gateway}
            tokenStorage={tokenStorage}
          >
            <SessionRoutes />
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootContent />
    </ThemeProvider>
  );
}

const useStyles = makeStyles((colors) => ({
  root: {
    flex: 1,
  },
  safe: {
    backgroundColor: colors.brand,
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
}));
