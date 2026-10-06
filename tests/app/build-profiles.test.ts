import easConfig from '../../eas.json';
import packageJson from '../../package.json';

describe('EAS build profiles', () => {
  it('configures an internal development client', () => {
    expect(easConfig.build.development).toMatchObject({
      developmentClient: true,
      distribution: 'internal',
      environment: 'development',
      env: {
        APP_VARIANT: 'development',
        APP_AUTH_MODE: 'api',
      },
    });
    expect(packageJson.dependencies['expo-dev-client']).toBeDefined();
  });

  it('configures staging for internal validation', () => {
    expect(easConfig.build.staging).toMatchObject({
      distribution: 'internal',
      environment: 'preview',
      env: {
        APP_VARIANT: 'staging',
        APP_AUTH_MODE: 'api',
      },
      android: { buildType: 'apk' },
    });
  });

  it('configures production for store distribution', () => {
    expect(easConfig.build.production).toMatchObject({
      distribution: 'store',
      environment: 'production',
      env: {
        APP_VARIANT: 'production',
        APP_AUTH_MODE: 'api',
      },
    });
  });

  it('does not commit an API URL or secret to build profiles', () => {
    const serialized = JSON.stringify(easConfig);

    expect(serialized).not.toContain('EXPO_PUBLIC_API_URL');
    expect(serialized).not.toMatch(/token|password|secret/i);
  });
});
