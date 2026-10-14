import { defineConfig, devices } from "@playwright/test";
import { E2E_ADMIN_EMAIL } from "./e2e/test-users";

for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // ファイルが無ければスキップ
  }
}

const isPreview = process.env.E2E_ENV === "preview";

if (isPreview && !process.env.E2E_PREVIEW_URL) {
  throw new Error(
    "E2E_ENV=preview requires E2E_PREVIEW_URL (e.g. https://my-app-preview.<account>.workers.dev)"
  );
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: isPreview
      ? process.env.E2E_PREVIEW_URL
      : "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
  webServer: isPreview
    ? undefined
    : {
        command: "pnpm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          ADMIN_EMAILS: E2E_ADMIN_EMAIL,
        },
      },
});
