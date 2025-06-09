module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  setupFiles: ['<rootDir>/jest.setup.js'],

  testTimeout: 15000,

  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.m?[tj]s$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase|expo-.*|@expo/.*|react-native|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '^expo-constants$': '<rootDir>/src/firestoreService/__tests__/mocks/expo-constants.js', // Adjusted path to be from root
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
};