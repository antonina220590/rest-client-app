import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './app/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'coverage/',
        '.vite/',
        'postcss.config.js',
        'tailwind.config.ts',
        'eslint.config.mjs',
        'vitest.config.mts',
        'next.config.mjs',
        '**/*.d.ts',
        'vite-env.d.ts',
        'next-env.d.ts',
      ],
    },
  },
});
