import { defineConfig, devices } from "@playwright/test";

const PORT = 3123;

// The app runs as a production build with placeholder env, so no real database,
// Pusher, or Gemini is contacted. Specs stub the API calls they depend on.
const env = {
  DATABASE_URL: "postgresql://e2e:e2e@127.0.0.1:1/e2e",
  GOOGLE_AI_STUDIO_KEY: "e2e",
  NEXTAUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-00",
  NEXTAUTH_URL: `http://127.0.0.1:${PORT}`,
  PUSHER_APP_ID: "1",
  PUSHER_KEY: "e2e",
  PUSHER_SECRET: "e2e",
  PUSHER_CLUSTER: "ap1",
  NEXT_PUBLIC_PUSHER_KEY: "e2e",
  NEXT_PUBLIC_PUSHER_CLUSTER: "ap1",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky test should be visible, not retried away
  // Same as CI. With the local default (half the CPU cores) the browsers starve the
  // freshly built server, and the first tests time out on slow responses.
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/privacy`,
    env,
    timeout: 5 * 60_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
