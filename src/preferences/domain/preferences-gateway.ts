import type { ThemeOption } from './theme-option';

export type PreferencesGateway = Readonly<{
  listThemes(): Promise<readonly ThemeOption[]>;
  getSelectedThemeIds(): Promise<ReadonlySet<string>>;
  replaceThemes(themeIds: readonly string[]): Promise<void>;
}>;
