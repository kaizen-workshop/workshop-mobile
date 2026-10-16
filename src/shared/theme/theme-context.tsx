import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  StyleSheet,
  useColorScheme,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  darkColors,
  lightColors,
  type ColorPalette,
} from '@/shared/theme/tokens';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export const themePreferenceStorageKey = 'kaizen.theme-preference';

export const themePreferences: readonly ThemePreference[] = [
  'system',
  'light',
  'dark',
];

type Theme = Readonly<{
  colors: ColorPalette;
  scheme: ColorScheme;
  preference: ThemePreference;
  setPreference(preference: ThemePreference): void;
}>;

const defaultTheme: Theme = {
  colors: lightColors,
  scheme: 'light',
  preference: 'system',
  setPreference: () => undefined,
};

const ThemeContext = createContext<Theme>(defaultTheme);

export function resolveScheme(
  preference: ThemePreference,
  system: string | null | undefined,
): ColorScheme {
  if (preference === 'system') return system === 'dark' ? 'dark' : 'light';
  return preference;
}

function isPreference(value: unknown): value is ThemePreference {
  return (themePreferences as readonly unknown[]).includes(value);
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(themePreferenceStorageKey)
      .then((stored) => {
        if (active && isPreference(stored)) setPreferenceState(stored);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(themePreferenceStorageKey, next).catch(
      () => undefined,
    );
  }, []);

  const value = useMemo<Theme>(() => {
    const scheme = resolveScheme(preference, system);
    return {
      colors: scheme === 'dark' ? darkColors : lightColors,
      scheme,
      preference,
      setPreference,
    };
  }, [preference, system, setPreference]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

/**
 * Builds a themed `StyleSheet`. Call the returned hook inside a component:
 * `const useStyles = makeStyles((colors) => ({ ... }))`.
 */
export function makeStyles<T extends NamedStyles<T>>(
  factory: (colors: ColorPalette) => T,
) {
  return function useStyles() {
    const { colors } = useTheme();
    return useMemo(
      () => StyleSheet.create(factory(colors) as never) as T,
      [colors],
    );
  };
}
