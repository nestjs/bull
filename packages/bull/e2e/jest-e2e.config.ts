import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

const { compilerOptions } = JSON.parse(
  readFileSync(join(__dirname, '..', 'tsconfig.spec.json'), 'utf-8'),
);

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: '<rootDir>/',
});

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../.',
  testRegex: '/e2e/.*\\.(e2e-test|e2e-spec).(ts|tsx|js)$',
  moduleNameMapper,
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  testEnvironment: 'node',
};

export default config;
