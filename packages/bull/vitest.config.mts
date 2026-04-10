import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['lib/**/*.spec.ts'],
    alias: {
      '@nestjs/bull-shared': resolve(import.meta.dirname, '../bull-shared/lib'),
    },
  },
});
