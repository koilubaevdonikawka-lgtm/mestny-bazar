import { defineConfig, devices } from "@playwright/test";

/**
 * Deliberately separate from vitest.config.ts (server/shared unit tests) —
 * this is real browser automation against a real running server, a
 * different class of test entirely. Targets the LOCAL dev server, not
 * production: an E2E suite that depends on mesnyibazar.com being reachable
 * would (a) not catch a regression before it ships, since it can only test
 * what's already deployed, (b) send real traffic to the live site on every
 * run, and (c) make test results depend on production uptime/network,
 * unrelated to the code under test. webServer below starts `npm run dev`
 * automatically (reusing an already-running one locally, always fresh in
 * CI) so the suite exercises the same code + the same live Supabase catalog
 * data the deployed site uses, without touching the deployed Worker itself.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
