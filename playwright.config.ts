import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,          // per-test budget (covers beforeEach + test body)
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 1, // 1 retry locally too — external site can be flaky
  workers: process.env.CI ? 1 : 2, // cap at 2 to avoid rate-limiting saucedemo.com
  reporter: [['html'], ['list']],

  use: {
    baseURL: 'https://www.saucedemo.com',
   // launchOptions: {slowMo :800},
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
