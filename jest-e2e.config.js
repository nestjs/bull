module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "/e2e/.*\\.(e2e-test|e2e-spec).(ts|tsx|js)$",
  collectCoverageFrom: [
    "lib/**/*.{js,jsx,tsx,ts}",
    "!**/node_modules/**",
    "!**/vendor/**",
    "!**/*.spec.ts"
  ],
  coverageReporters: ["lcov"],
  coverageDirectory: "coverage/e2e"
};
