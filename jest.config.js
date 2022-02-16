module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/setup-jest.js'],
  testRegex: '/lib/.*\\.(test|spec).(ts|tsx|js)$',
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,tsx,ts}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/*.spec.ts',
  ],
  coverageReporters: ['lcov'],
  coverageDirectory: 'coverage/unit',
};
