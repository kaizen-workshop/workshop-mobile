import type { TokenStorage } from '@/core/secure-storage';
import type { HttpClient } from '@/core/http';
import { AppError } from '@/core/errors';
import type { PreferencesGateway, ThemeOption } from '@/preferences/domain';

type ThemeResponse = Readonly<{
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}>;

type ProfileResponse = Readonly<{
  themes: readonly ThemeResponse[];
}>;

export function createApiPreferencesGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): PreferencesGateway {
  return {
    async listThemes() {
      const tokens = await tokenStorage.read();
      if (!tokens) throw new AppError({ category: 'unauthorized' });

      const response = await http.request<unknown>({
        path: '/themes',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      if (!Array.isArray(response) || !response.every(isThemeResponse)) {
        throw new AppError({
          category: 'unknown',
          technicalMessage: 'Invalid themes response.',
        });
      }

      return response.map(toThemeOption);
    },
    async getSelectedThemeIds() {
      const tokens = await tokenStorage.read();
      if (!tokens) throw new AppError({ category: 'unauthorized' });

      const response = await http.request<unknown>({
        path: '/users/me',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
      if (!isProfileResponse(response)) {
        throw new AppError({
          category: 'unknown',
          technicalMessage: 'Invalid profile response.',
        });
      }
      return new Set(response.themes.map((theme) => theme.id));
    },
    async replaceThemes(themeIds) {
      const tokens = await tokenStorage.read();
      if (!tokens) throw new AppError({ category: 'unauthorized' });

      await http.request<void>({
        path: '/users/me/themes',
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        body: { themeIds },
      });
    },
  };
}

function isProfileResponse(value: unknown): value is ProfileResponse {
  if (!value || typeof value !== 'object' || !('themes' in value)) return false;
  return Array.isArray(value.themes) && value.themes.every(isThemeResponse);
}

function isThemeResponse(value: unknown): value is ThemeResponse {
  if (!value || typeof value !== 'object') return false;
  const theme = value as Partial<ThemeResponse>;
  return (
    typeof theme.id === 'string' &&
    typeof theme.name === 'string' &&
    (theme.description === null || typeof theme.description === 'string') &&
    typeof theme.active === 'boolean'
  );
}

function toThemeOption(theme: ThemeResponse): ThemeOption {
  return {
    id: theme.id,
    name: theme.name,
    ...(theme.description ? { description: theme.description } : {}),
  };
}
