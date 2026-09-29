import type { ThemeOption } from './theme-option';

export type PreferencesGateway = Readonly<{
  listThemes(): Promise<readonly ThemeOption[]>;
}>;
