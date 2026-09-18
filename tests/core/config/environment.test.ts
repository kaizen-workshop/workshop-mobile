import { getEnvironment } from '@/core/config/environment';

describe('getEnvironment', () => {
  it('normalizes a valid public API URL', () => {
    expect(
      getEnvironment({
        APP_VARIANT: 'staging',
        EXPO_PUBLIC_API_URL: 'https://api.example.test/api/v1/',
      }),
    ).toEqual({
      variant: 'staging',
      apiUrl: 'https://api.example.test/api/v1',
    });
  });

  it('rejects invalid variants and URLs', () => {
    expect(() =>
      getEnvironment({
        APP_VARIANT: 'test',
        EXPO_PUBLIC_API_URL: 'https://api.example.test',
      }),
    ).toThrow('APP_VARIANT inválido');
    expect(() =>
      getEnvironment({
        APP_VARIANT: 'development',
        EXPO_PUBLIC_API_URL: 'ftp://api.example.test',
      }),
    ).toThrow('EXPO_PUBLIC_API_URL inválida');
  });
});
