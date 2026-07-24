export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEnv: ['./src/__tests__/setup.js'],
  testMatch: ['**/src/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/tests/**',
    '!src/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 8,
      functions: 10,
      lines: 25,
      statements: 25,
    },
  },
}
