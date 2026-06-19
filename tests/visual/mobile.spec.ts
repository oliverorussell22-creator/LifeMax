import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

test("private beta shell renders at 390px without fake data or horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "LifeMax remembers the small signals around your day." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("banner").getByText("Private beta shell")).toBeVisible();
  await expect(page.getByLabel("Current state summary").getByText("WHOOP")).toBeVisible();
  await expect(page.getByLabel("Current state summary").getByText("Not connected")).toBeVisible();
  await expect(page.getByText("No check-in captured yet.")).toBeVisible();
  await expect(page.getByText("Goose helper")).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(page.getByText(/readiness score|recovery score|strain score/i)).toHaveCount(0);
  const legacyRuntimeLabels = ["Tele" + "gram", "n" + "8n", "Gr" + "ok", "M" + "CP"];
  for (const label of legacyRuntimeLabels) {
    await expect(page.getByText(label, { exact: false })).toHaveCount(0);
  }

  mkdirSync(path.resolve("reports/screenshots"), { recursive: true });
  await page.screenshot({
    path: path.resolve("reports/screenshots/lifemax-shell-390.png"),
    fullPage: true
  });
});

test("privacy policy renders at 390px without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/privacy");

  await expect(page.getByRole("heading", { name: "LifeMax Privacy Policy" })).toBeVisible();
  await expect(page.getByText("LifeMax is a personal health and wellness tracking app")).toBeVisible();
  await expect(page.getByText("LifeMax is not a medical device")).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  mkdirSync(path.resolve("reports/screenshots"), { recursive: true });
  await page.screenshot({
    path: path.resolve("reports/screenshots/lifemax-privacy-390.png"),
    fullPage: true
  });
});
