import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  test: {
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    globals: true,
    include: ['__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    server: {
      deps: {
        inline: ['@copilotkit/react-core', '@copilotkit/react-ui', '@copilotkit/runtime', '@copilotkit/shared'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
