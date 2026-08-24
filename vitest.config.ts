import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => ({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Load .env so DATABASE_URL is available to the Prisma client in tests.
    env: loadEnv(mode, process.cwd(), ''),
    // Integration tests share one Postgres; run files serially.
    fileParallelism: false,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
}))
