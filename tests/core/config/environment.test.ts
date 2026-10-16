import { getEnvironment } from '@/core/config';

it('rejects HTTP outside development', () => {
  expect(() =>
    getEnvironment({
      APP_VARIANT: 'production',
      EXPO_PUBLIC_API_URL: 'http://api.example.test',
    }),
  ).toThrow('HTTPS');
});

it('allows HTTP in development for local testing', () => {
  expect(
    getEnvironment({
      APP_VARIANT: 'development',
      EXPO_PUBLIC_API_URL: 'http://localhost:8080/api/v1',
    }),
  ).toMatchObject({
    variant: 'development',
    apiUrl: 'http://localhost:8080/api/v1',
  });
});
