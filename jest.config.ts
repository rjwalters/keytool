/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^\\$lib/(.*)": "<rootDir>/src/lib/$1",
    "^\\$utils/(.*)": "<rootDir>/src/lib/utils/$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFiles: [],
  verbose: true,
};
