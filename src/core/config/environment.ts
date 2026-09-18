export const appVariants = ['development', 'staging', 'production'] as const;
export type AppVariant = (typeof appVariants)[number];
export type EnvironmentConfig = Readonly<{
  variant: AppVariant;
  apiUrl: string;
}>;

export function getEnvironment(
  input: Record<string, string | undefined> = process.env,
): EnvironmentConfig {
  const variant = input.APP_VARIANT;
  if (!appVariants.includes(variant as AppVariant))
    throw new Error(
      'APP_VARIANT inválido. Use development, staging ou production.',
    );
  try {
    const url = new URL(input.EXPO_PUBLIC_API_URL ?? '');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return {
      variant: variant as AppVariant,
      apiUrl: url.toString().replace(/\/$/, ''),
    };
  } catch {
    throw new Error(
      'EXPO_PUBLIC_API_URL inválida. Informe uma URL HTTP(S) absoluta.',
    );
  }
}
