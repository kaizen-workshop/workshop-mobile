/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Reanimated/worklets need their native entry points skipped under jest.
  resolver: 'react-native-worklets/jest/resolver',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
