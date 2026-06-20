import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const screenshotDir = path.resolve("reports/screenshots/functional");
const highFunctionalityDir = path.resolve("reports/screenshots/high-functionality");

test("local demo loop works on mobile and persists after refresh", async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  mkdirSync(screenshotDir, { recursive: true });
  mkdirSync(highFunctionalityDir, { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByRole("heading", { name: "Check in, then keep the day honest." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByText("Local cache ready")).toBeVisible();
  await expect(page.getByText("WHOOP, accounts, AI, and backend sync are not connected in this app shell.")).toBeVisible();

  await page.getByTestId("save-checkin").click();
  await expect(page.getByText("The local check-in is enough to choose one next action.")).toBeVisible();
  await expect(page.getByText("State")).toBeVisible();
  await page.getByLabel("Must-do").fill("Draft the client note");
  await page.getByLabel("Optional move 1").fill("Ten minute walk");
  await page.getByLabel("Optional move 2").fill("Capture caffeine timing");
  await page.getByLabel("Avoid today").fill("No second priority after lunch");
  await page.getByLabel("Shutdown target").fill("8:45 PM");
  await page.getByTestId("save-plan").click();
  await page.getByTestId("plan-must_do-done").click();
  await page.getByTestId("plan-optional_1-skipped").click();
  await expect(page.getByLabel("Daily plan editor").getByText("1/3 done")).toBeVisible();
  await page.getByLabel("What got done").fill("Client note drafted");
  await page.getByLabel("What slipped").fill("Walk moved to tomorrow");
  await page.getByLabel("Why").fill("Afternoon friction was higher than expected.");
  await page.getByRole("button", { name: "Draining" }).click();
  await page.getByLabel("Tomorrow hint").fill("Walk before opening messages");
  await page.getByTestId("save-evening-close").click();
  await expect(page.getByRole("heading", { name: "Close saved for today" })).toBeVisible();
  await expect(page.getByLabel("Today state").getByText("Afternoon friction was higher than expected.")).toBeVisible();

  await page.goto("/capture");
  await page.getByTestId("capture-kind-habit").click();
  await page.getByRole("button", { name: "Helped" }).click();
  await page.getByLabel("Label").fill("morning walk");
  await page.getByLabel("Note").fill("felt easier after breakfast");
  await page.getByTestId("save-capture").click();
  await expect(page.getByText("morning walk")).toBeVisible();
  await expect(page.getByLabel("Capture list").getByText("helped")).toBeVisible();

  await page.goto("/patterns");
  await expect(page.getByRole("heading", { name: "Manual evidence worth watching" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manual signals are starting to cluster" })).toBeVisible();
  await page.getByTestId("pattern-watch-local-pattern-energy").click();
  await expect(page.getByText("Decision: watching")).toBeVisible();

  await page.goto("/experiments");
  await page.getByTestId("start-experiment").click();
  await expect(page.getByText("Minimum window: 3 days.")).toBeVisible();
  await page.getByTestId("mark-inconclusive").click();
  await expect(page.getByRole("heading", { name: "Experiment ended inconclusive." })).toBeVisible();

  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy policy and local data boundary." })).toBeVisible();
  await expect(page.getByText("This app shell does not connect WHOOP")).toBeVisible();
  await expect(page.getByText("daily plan, evening close, memory candidates")).toBeVisible();

  await page.goto("/today");
  await page.reload();
  await expect(page.getByText("Saved locally")).toBeVisible();
  await expect(page.getByText("Local captures")).toBeVisible();
  await expect(page.getByLabel("Today command center").getByText("Walk before opening messages")).toBeVisible();
  await expect(page.getByLabel("Current state summary").getByText("1/3 done")).toBeVisible();
  await expect(page.getByLabel("Must-do")).toHaveValue("Draft the client note");
  await expect(page.getByLabel("Optional move 1")).toHaveValue("Ten minute walk");
  await expect(page.getByLabel("Optional move 2")).toHaveValue("Capture caffeine timing");
  await expect(page.getByLabel("Avoid today")).toHaveValue("No second priority after lunch");

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(page.getByText(/readiness score|recovery score|strain score/i)).toHaveCount(0);

  await page.screenshot({
    path: path.join(screenshotDir, "local-demo-mobile-390.png"),
    fullPage: true
  });
  await page.screenshot({
    path: path.join(highFunctionalityDir, "local-high-functionality-mobile-390.png"),
    fullPage: true
  });
  await page.screenshot({
    path: path.resolve("reports/screenshots/wave0-shell-390.png"),
    fullPage: true
  });

  expect(runtimeErrors()).toEqual([]);
});

test("desktop shell exposes side navigation and privacy route without overflow", async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  mkdirSync(screenshotDir, { recursive: true });
  mkdirSync(highFunctionalityDir, { recursive: true });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/today");

  await expect(page.getByRole("navigation", { name: "Primary sections" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy and data handling" })).toBeVisible();
  await expect(page.getByRole("region", { name: "App status" }).getByText("Sync", { exact: true })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await page.screenshot({
    path: path.join(screenshotDir, "local-demo-desktop-1280.png"),
    fullPage: true
  });
  await page.screenshot({
    path: path.join(highFunctionalityDir, "local-high-functionality-desktop-1280.png"),
    fullPage: true
  });

  expect(runtimeErrors()).toEqual([]);
});

function collectRuntimeErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console:${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`pageerror:${error.message}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 500) {
      errors.push(`http:${response.status()}:${response.url()}`);
    }
  });

  return () => errors;
}
