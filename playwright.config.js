// Playwright smoke suite for the ui. `yarn test:e2e` builds the app in the
// e2e mode (see .env.e2e), serves that build with vite preview, and drives it
// in Chromium at desktop and phone widths with both services mocked in the
// browser (e2e/mock-api.js). No Docker, no database, no network.
import { defineConfig, devices } from '@playwright/test'

const PORT = 4100

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `yarn vite build --mode e2e --outDir dist-e2e && yarn vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
