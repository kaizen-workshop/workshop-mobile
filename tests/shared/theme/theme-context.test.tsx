import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import {
  resolveScheme,
  ThemeProvider,
  themePreferenceStorageKey,
  useTheme,
} from '@/shared/theme';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
    },
  };
});

function Probe() {
  const { colors, scheme, setPreference } = useTheme();
  return (
    <>
      <Text>{`${scheme}:${colors.background}`}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setPreference('dark')}
      >
        <Text>Escuro</Text>
      </Pressable>
    </>
  );
}

it('resolves the scheme from the preference and the system', () => {
  expect(resolveScheme('system', 'dark')).toBe('dark');
  expect(resolveScheme('system', null)).toBe('light');
  expect(resolveScheme('light', 'dark')).toBe('light');
  expect(resolveScheme('dark', 'light')).toBe('dark');
});

it('switches palette and persists the chosen preference', async () => {
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  expect(screen.getByText('light:#F5F6FA')).toBeTruthy();

  fireEvent.press(screen.getByText('Escuro'));

  await waitFor(() => expect(screen.getByText('dark:#0B0F1A')).toBeTruthy());
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    themePreferenceStorageKey,
    'dark',
  );
});
