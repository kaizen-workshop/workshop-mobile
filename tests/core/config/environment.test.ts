import { getAppVariant, getEnvironment } from '@/core/config/environment';

describe('getEnvironment', () => {
  it('resolves the build variant independently from the bundle mode', () => {
    expect(getAppVariant({ APP_VARIANT: 'staging' })).toBe('staging');
    expect(getAppVariant({ APP_VARIANT: 'production' })).toBe('production');
  });

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

  it('reads public build variables when no test configuration is supplied', () => {
    const previousVariant = process.env.EXPO_PUBLIC_APP_VARIANT;
    const previousApiUrl = process.env.EXPO_PUBLIC_API_URL;
    const legacyVariant = process.env.APP_VARIANT;

    try {
      delete process.env.APP_VARIANT;
      process.env.EXPO_PUBLIC_APP_VARIANT = 'staging';
      process.env.EXPO_PUBLIC_API_URL = 'https://staging.example.test/api/v1';

      expect(getAppVariant()).toBe('staging');
      expect(getEnvironment()).toEqual({
        variant: 'staging',
        apiUrl: 'https://staging.example.test/api/v1',
      });
    } finally {
      if (previousVariant === undefined)
        delete process.env.EXPO_PUBLIC_APP_VARIANT;
      else process.env.EXPO_PUBLIC_APP_VARIANT = previousVariant;
      if (previousApiUrl === undefined) delete process.env.EXPO_PUBLIC_API_URL;
      else process.env.EXPO_PUBLIC_API_URL = previousApiUrl;
      if (legacyVariant === undefined) delete process.env.APP_VARIANT;
      else process.env.APP_VARIANT = legacyVariant;
    }
  });
});
