export const appVariants = ['development', 'staging', 'production'] as const;
export type AppVariant = (typeof appVariants)[number];
export type EnvironmentConfig = Readonly<{
  variant: AppVariant;
  apiUrl: string;
}>;

export function getAppVariant(
  input: Record<string, string | undefined> = publicBuildEnvironment(),
): AppVariant {
  const variant = input.APP_VARIANT ?? (__DEV__ ? 'development' : 'production');
  if (!appVariants.includes(variant as AppVariant))
    throw new Error(
      'APP_VARIANT inválido. Use development, staging ou production.',
    );
  return variant as AppVariant;
}

export function getEnvironment(
  input: Record<string, string | undefined> = publicBuildEnvironment(),
): EnvironmentConfig {
  const variant = getAppVariant(input);
  try {
    const url = new URL(input.EXPO_PUBLIC_API_URL ?? '');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return {
      variant,
      apiUrl: url.toString().replace(/\/$/, ''),
    };
  } catch {
    throw new Error(
      'EXPO_PUBLIC_API_URL inválida. Informe uma URL HTTP(S) absoluta.',
    );
  }
}

function publicBuildEnvironment(): Record<string, string | undefined> {
  return {
    APP_VARIANT: process.env.EXPO_PUBLIC_APP_VARIANT,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  };
}
