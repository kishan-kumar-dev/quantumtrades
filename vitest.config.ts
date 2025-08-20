import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'istanbul',   // <- Add this line
      reporter: ['text', 'lcov'],
    },
  },
});
