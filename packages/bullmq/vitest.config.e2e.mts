import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['e2e/**/*.e2e-spec.ts'],
    alias: {
      '@nestjs/bull-shared': resolve(import.meta.dirname, '../bull-shared/lib'),
    },
  },
});
