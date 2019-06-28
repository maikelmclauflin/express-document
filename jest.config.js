const {
  defaults
} = require('jest-config')
module.exports = {
  "verbose": true,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  testMatch: [
    '**/*.test.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup.js'],
  verbose: true,
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  preset: 'ts-jest'
}
