import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// A machine with a pre-installed Chromium (e.g. the Claude Code cloud container) exposes it here;
// elsewhere Playwright uses its own download. Override with PW_CHROMIUM=/path/to/chromium.
const preinstalled = '/opt/pw-browsers/chromium';
const executablePath =
  process.env.PW_CHROMIUM ?? (existsSync(preinstalled) ? preinstalled : undefined);

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
