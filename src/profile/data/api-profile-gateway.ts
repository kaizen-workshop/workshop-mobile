import { AppError } from '@/core/errors';
import type { HttpClient } from '@/core/http';
import type { TokenStorage } from '@/core/secure-storage';
import type { ProfileUpdate, UserProfile } from '@/profile/domain/profile';

type ProfileResponse = Readonly<{
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  themes: readonly { id: string; name: string }[];
}>;

export type ProfileGateway = Readonly<{
  load(): Promise<UserProfile>;
  update(input: ProfileUpdate): Promise<UserProfile>;
}>;

export function createApiProfileGateway(
  http: HttpClient,
  tokenStorage: TokenStorage,
): ProfileGateway {
  const request = async (input: {
    method?: string;
    body?: unknown;
  }): Promise<UserProfile> => {
    const tokens = await tokenStorage.read();
    if (!tokens) throw new AppError({ category: 'unauthorized' });
    const response = await http.request<unknown>({
      path: '/users/me',
      ...(input.method ? { method: input.method } : {}),
      ...(input.body === undefined ? {} : { body: input.body }),
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!isProfileResponse(response)) throw invalidResponse();
    return toProfile(response);
  };

  return {
    load: () => request({}),
    update(input) {
      if (!input.name.trim()) throw new AppError({ category: 'bad_request' });
      return request({ method: 'PATCH', body: input });
    },
  };
}

function isProfileResponse(value: unknown): value is ProfileResponse {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<ProfileResponse>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.username === 'string' &&
    typeof profile.email === 'string' &&
    (profile.phone === null || typeof profile.phone === 'string') &&
    (profile.profileImage === null ||
      typeof profile.profileImage === 'string') &&
    Array.isArray(profile.themes) &&
    profile.themes.every(
      (theme) =>
        !!theme &&
        typeof theme === 'object' &&
        typeof theme.id === 'string' &&
        typeof theme.name === 'string',
    )
  );
}

function toProfile(value: ProfileResponse): UserProfile {
  return {
    id: value.id,
    name: value.name,
    username: value.username,
    email: value.email,
    ...(value.phone ? { phone: value.phone } : {}),
    ...(value.profileImage ? { profileImage: value.profileImage } : {}),
    themeNames: value.themes.map((theme) => theme.name),
  };
}

function invalidResponse() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Invalid profile response.',
  });
}
