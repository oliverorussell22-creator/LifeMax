import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 390, height: 844 },
    colorScheme: "light"
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process["env"].CI,
    timeout: 120_000
  }
});
