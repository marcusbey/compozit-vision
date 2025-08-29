module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/services/__tests__/geminiService.simple.test.ts',
  ],
  collectCoverageFrom: [
    'src/services/geminiService.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage-gemini',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Skip all React Native related transforms
  transformIgnorePatterns: [
    'node_modules/(?!(@google/generative-ai)/)',
  ],
  // Prevent loading React Native setup
  setupFiles: [],
};