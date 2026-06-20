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
  await expect(page.getByTestId("generate-local-plan")).toBeDisabled();
  const mobileContentBox = await page.locator("main.content").boundingBox();
  expect(mobileContentBox?.width).toBeGreaterThan(340);

  const restartPanel = page.getByLabel("Quick restart");
  await expect(restartPanel.getByRole("heading", { name: "Quick restart is ready." })).toBeVisible();
  await restartPanel.getByRole("button", { name: "3 days" }).click();
  await restartPanel.getByRole("button", { name: "Low" }).click();
  await restartPanel.getByRole("button", { name: "Rough" }).click();
  await page.getByLabel("One restart priority").fill("Open the client draft");
  await page.getByLabel("What changed").fill("Missed yesterday after travel");
  await restartPanel.getByRole("button", { name: "Evening only" }).click();
  await page.getByTestId("save-quick-restart").click();
  await expect(page.getByRole("heading", { name: "Quick restart saved." })).toBeVisible();
  await expect(page.getByLabel("Restart: Open the client draft")).toBeVisible();
  await expect(page.getByLabel("Current state summary").getByText("Restart")).toBeVisible();
  await page.getByTestId("generate-local-plan").click();
  await expect(page.getByLabel("Today command center").getByRole("status")).toContainText("Generated a browser-local plan");
  await expect(page.getByLabel("Daily plan editor").getByLabel("Must-do")).toHaveValue("Open the client draft");

  await page.getByTestId("save-checkin").click();
  await expect(page.getByText("A lower intensity cap protects the day from turning into a productivity push.")).toBeVisible();
  await expect(page.getByText("State", { exact: true })).toBeVisible();
  await page.getByLabel("Must-do").fill("Draft the client note");
  await page.getByLabel("Optional move 1").fill("Ten minute walk");
  await page.getByLabel("Optional move 2").fill("Capture caffeine timing");
  await page.getByLabel("Avoid today").fill("No second priority after lunch");
  await page.getByLabel("Shutdown target").fill("8:45 PM");
  await page.getByTestId("save-plan").click();
  await page.getByTestId("plan-must_do-done").click();
  await page.getByTestId("plan-optional_1-skipped").click();
  await expect(page.getByLabel("Daily plan editor").getByText("1/3 done")).toBeVisible();
  await page.getByRole("button", { name: "Overloaded" }).click();
  await page.getByRole("button", { name: "Short walk" }).click();
  await page.getByLabel("Next lower-intensity move").fill("Ten minute walk without phone");
  await page.getByLabel("Defer until").fill("after lunch");
  await page.getByLabel("Rescue note").fill("Messages scattered the plan");
  await page.getByTestId("save-midday-rescue").click();
  await expect(page.getByRole("heading", { name: "Midday rescue saved." })).toBeVisible();
  await expect(page.getByLabel("Today command center").getByText("Ten minute walk without phone")).toBeVisible();
  await expect(page.getByLabel("Current state summary").getByText("Rescue")).toBeVisible();
  await page.getByLabel("What got done").fill("Client note drafted");
  await page.getByLabel("What slipped").fill("Walk moved to tomorrow");
  await page.getByLabel("Why").fill("Afternoon friction was higher than expected.");
  await page.getByRole("button", { name: "Draining" }).click();
  await page.getByLabel("Tomorrow hint").fill("Walk before opening messages");
  await page.getByTestId("save-evening-close").click();
  await expect(page.getByRole("heading", { name: "Close saved for today" })).toBeVisible();
  await expect(page.getByLabel("Memory inbox").getByText("Walk before opening messages: Afternoon friction was higher than expected.")).toBeVisible();

  await page.goto("/capture");
  await page.getByTestId("capture-kind-habit").click();
  await page.getByRole("button", { name: "Helped" }).click();
  await page.getByLabel("Label", { exact: true }).fill("morning walk");
  await page.getByLabel("Note", { exact: true }).fill("felt easier after breakfast");
  await page.getByTestId("save-capture").click();
  const captureList = page.getByLabel("Capture list");
  const firstCapture = captureList.getByLabel("Capture: morning walk");
  await expect(firstCapture).toBeVisible();
  await expect(firstCapture.locator(".event-impact")).toHaveText("helped");
  await firstCapture.getByLabel("Capture label: morning walk").fill("morning walk after breakfast");
  await firstCapture.getByLabel("Capture note: morning walk").fill("felt easier after breakfast; less friction");
  await firstCapture.getByRole("button", { name: "Save edit" }).click();
  await expect(captureList.getByRole("status")).toContainText("Capture edit saved locally");
  await expect(captureList.getByLabel("Capture: morning walk after breakfast")).toBeVisible();
  await page.getByLabel("Label", { exact: true }).fill("delete proof");
  await page.getByLabel("Note", { exact: true }).fill("remove this local mistake");
  await page.getByTestId("save-capture").click();
  const deleteCapture = captureList.getByLabel("Capture: delete proof");
  await expect(deleteCapture).toBeVisible();
  await deleteCapture.getByRole("button", { name: "Delete" }).click();
  await expect(captureList.getByLabel("Capture: delete proof")).toHaveCount(0);
  await page.reload();
  await expect(captureList.getByLabel("Capture: morning walk after breakfast")).toBeVisible();
  await expect(captureList.getByLabel("Capture: delete proof")).toHaveCount(0);
  await page.locator('section[aria-label="Capture list"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Capture list"]').screenshot({
    path: path.join(highFunctionalityDir, "local-capture-correction-mobile-390.png")
  });

  await page.goto("/patterns");
  await expect(page.getByRole("heading", { name: "Manual evidence worth watching" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manual signals are starting to cluster" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Local day review ready." })).toBeVisible();
  await expect(page.getByLabel("Local day review").getByText("Tomorrow cue")).toBeVisible();
  await page.getByTestId("pattern-watch-local-pattern-energy").click();
  await expect(page.getByText("Decision: watching")).toBeVisible();
  await page.getByTestId("save-review-checkpoint").click();
  await expect(page.getByRole("heading", { name: "Review checkpoint saved." })).toBeVisible();
  await expect(page.getByLabel("Local day review").getByText("health integrations disabled")).toBeVisible();
  await page.getByTestId("archive-day").click();
  await expect(page.getByLabel("Local day review").getByRole("status")).toContainText("Day saved to browser-local history");
  await expect(page.getByLabel("Local history insight").getByRole("heading", { name: "One checkpoint, not a trend yet" })).toBeVisible();
  await expect(page.getByLabel("Local history insight").getByText("Archive one more closed day")).toBeVisible();
  await expect(page.getByLabel("Local day history").getByRole("heading", { name: "1 local day archived" })).toBeVisible();
  await expect(page.getByLabel("Local day history").locator(".history-item").getByText("Walk before opening messages", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Local history insight").getByRole("heading", { name: "One checkpoint, not a trend yet" })).toBeVisible();
  await expect(page.getByLabel("Local day history").getByRole("heading", { name: "1 local day archived" })).toBeVisible();
  await page.getByTestId(/^use-history-cue-/).click();
  await expect(page.getByLabel("Local day history").getByRole("status")).toContainText("Moved \"Walk before opening messages\" into Today's browser-local plan.");
  await page.goto("/today");
  await expect(page.getByLabel("Daily plan editor").getByLabel("Must-do")).toHaveValue("Walk before opening messages");
  await expect(page.getByLabel("Daily plan editor").getByLabel("Optional move 1")).toHaveValue("Draft the client note");
  await expect(page.getByLabel("Daily plan editor").getByLabel("Avoid today")).toHaveValue("Do not treat one archived day as a trend");
  await page.reload();
  await expect(page.getByLabel("Daily plan editor").getByLabel("Must-do")).toHaveValue("Walk before opening messages");
  await page.goto("/patterns");
  await expect(page.getByLabel("Local day history").getByRole("heading", { name: "1 local day archived" })).toBeVisible();
  await page.locator('section[aria-label="Local history insight"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Local history insight"]').screenshot({
    path: path.join(highFunctionalityDir, "local-history-insight-mobile-390.png")
  });
  await page.locator('section[aria-label="Local day review"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Local day review"]').screenshot({
    path: path.join(highFunctionalityDir, "local-day-review-mobile-390.png")
  });
  await page.locator('section[aria-label="Local day history"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Local day history"]').screenshot({
    path: path.join(highFunctionalityDir, "local-day-history-mobile-390.png")
  });

  await page.goto("/today");
  await expect(page.getByLabel("Today command center").getByText("History cue", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Today command center").getByText("Archive one more closed day")).toBeVisible();
  await page.locator('section[aria-label="Today command center"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Today command center"]').screenshot({
    path: path.join(highFunctionalityDir, "local-today-history-cue-mobile-390.png")
  });

  await page.goto("/experiments");
  await page.getByTestId("start-experiment").click();
  await expect(page.getByText("Minimum window: 3 days.")).toBeVisible();
  await page.getByRole("button", { name: "Better" }).click();
  await page.getByLabel("What changed?").fill("Morning block felt cleaner after the protected start.");
  await page.getByTestId("log-experiment-observation").click();
  await expect(page.getByLabel("Log experiment observation").getByRole("status")).toContainText("Observation saved locally");
  await expect(page.getByLabel("Experiment observations").getByText("Morning block felt cleaner")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Experiment observations").getByText("Morning block felt cleaner")).toBeVisible();
  await page.locator('section[aria-label="Active local experiment"]').evaluate((node) => node.scrollIntoView({ block: "start" }));
  await page.locator('section[aria-label="Active local experiment"]').screenshot({
    path: path.join(highFunctionalityDir, "local-experiment-observation-mobile-390.png")
  });
  const experimentDecision = page.locator('section[aria-label="Experiment decision"]');
  await expect(experimentDecision.getByText("Keep the test reversible")).toBeVisible();
  await experimentDecision.getByRole("button", { name: "Keep" }).click();
  await experimentDecision.getByLabel("Decision note").fill("Keep the protected first block, but do not add more rules.");
  await page.getByTestId("save-experiment-decision").click();
  await expect(page.getByRole("heading", { name: "Experiment decision saved." })).toBeVisible();
  await expect(page.getByLabel("Experiment result").getByText("Decision: keep")).toBeVisible();
  await expect(page.getByLabel("Experiment result").getByText("Plan handoff")).toBeVisible();
  await page.getByTestId("use-experiment-plan").click();
  await expect(page.getByLabel("Experiment result").getByRole("status")).toContainText(
    "Experiment decision moved into Today's browser-local plan."
  );
  await page.locator('section[aria-label="Experiment result"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Experiment result"]').screenshot({
    path: path.join(highFunctionalityDir, "local-experiment-plan-handoff-mobile-390.png")
  });
  await page.goto("/today");
  await expect(page.getByLabel("Daily plan editor").getByLabel("Must-do")).toHaveValue("Repeat kept part: protect first useful block");
  await expect(page.getByLabel("Daily plan editor").getByLabel("Optional move 1")).toHaveValue("Capture one before/after signal");
  await expect(page.getByLabel("Daily plan editor").getByLabel("Optional move 2")).toHaveValue("Close the loop without adding another rule");
  await expect(page.getByLabel("Daily plan editor").getByLabel("Avoid today")).toHaveValue("Do not scale beyond one block");
  await page.reload();
  await expect(page.getByLabel("Daily plan editor").getByLabel("Must-do")).toHaveValue("Repeat kept part: protect first useful block");
  await page.locator('section[aria-label="Daily plan editor"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Daily plan editor"]').screenshot({
    path: path.join(highFunctionalityDir, "local-experiment-plan-today-mobile-390.png")
  });

  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy policy and local data boundary." })).toBeVisible();
  await expect(page.getByText("This app shell does not connect WHOOP")).toBeVisible();
  await expect(page.getByText("daily plan, missed-day quick restart, midday rescue")).toBeVisible();

  await page.goto("/today");
  await page.reload();
  await expect(page.getByText("Saved locally")).toBeVisible();
  await expect(page.getByText("Local captures")).toBeVisible();
  await expect(page.getByLabel("Daily plan editor").getByLabel("Must-do")).toHaveValue("Repeat kept part: protect first useful block");
  await expect(page.getByLabel("Today command center").getByText("Ten minute walk without phone")).toBeVisible();
  await expect(page.getByLabel("Current state summary").getByText("0/3 done")).toBeVisible();
  await expect(page.getByLabel("Rescue: saved")).toBeVisible();
  await expect(page.getByLabel("Restart: saved")).toBeVisible();
  const memoryInbox = page.getByLabel("Memory inbox");
  const memoryCounts = memoryInbox.getByLabel("Memory counts");
  await expect(memoryInbox.getByRole("heading", { name: "7 active local memories" })).toBeVisible();
  await expect(memoryCounts.getByText("7 candidates")).toBeVisible();
  const firstMemory = memoryInbox.locator(".memory-item").first();
  await firstMemory.getByLabel(/Memory title:/).fill("Protected first block worked");
  await firstMemory.getByLabel(/Memory detail:/).fill("Morning block felt cleaner after the protected start.");
  await firstMemory.getByRole("button", { name: "Save edit" }).click();
  await expect(firstMemory.getByRole("status")).toContainText("Memory edit saved locally");
  await firstMemory.getByRole("button", { name: "Keep" }).click();
  await expect(firstMemory.getByRole("status")).toContainText("Memory kept locally");
  await expect(memoryCounts.getByText("1 kept")).toBeVisible();
  await memoryInbox.locator(".memory-item").nth(1).getByRole("button", { name: "Reject" }).click();
  await expect(memoryInbox.getByRole("heading", { name: "6 active local memories" })).toBeVisible();
  await expect(memoryCounts.getByText("1 rejected")).toBeVisible();
  await memoryInbox.locator(".memory-item").nth(2).getByRole("button", { name: "Delete" }).click();
  await expect(memoryInbox.getByRole("heading", { name: "5 active local memories" })).toBeVisible();
  await expect(memoryCounts.getByText("4 candidates")).toBeVisible();
  await expect(page.getByLabel("One restart priority")).toHaveValue("Open the client draft");
  await expect(page.getByLabel("What changed")).toHaveValue("Missed yesterday after travel");
  await expect(page.getByLabel("Must-do")).toHaveValue("Repeat kept part: protect first useful block");
  await expect(page.getByLabel("Optional move 1")).toHaveValue("Capture one before/after signal");
  await expect(page.getByLabel("Optional move 2")).toHaveValue("Close the loop without adding another rule");
  await expect(page.getByLabel("Avoid today")).toHaveValue("Do not scale beyond one block");
  await expect(page.getByLabel("Next lower-intensity move")).toHaveValue("Ten minute walk without phone");
  await expect(page.getByLabel("Defer until")).toHaveValue("after lunch");
  await expect(page.getByLabel("Rescue note")).toHaveValue("Messages scattered the plan");
  await expect(page.getByLabel("What got done")).toHaveValue("Client note drafted");
  await expect(page.getByLabel("What slipped")).toHaveValue("Walk moved to tomorrow");
  await expect(page.getByLabel("Why")).toHaveValue("Afternoon friction was higher than expected.");
  await expect(page.getByLabel("Tomorrow hint")).toHaveValue("Walk before opening messages");
  await page.reload();
  await expect(memoryInbox.getByRole("heading", { name: "5 active local memories" })).toBeVisible();
  await expect(memoryInbox.getByRole("textbox", { name: "Memory title: Protected first block worked" })).toHaveValue("Protected first block worked");
  await expect(memoryCounts.getByText("1 kept")).toBeVisible();
  await expect(memoryCounts.getByText("1 rejected")).toBeVisible();
  await memoryInbox.getByText("1 rejected local memory").click();
  await expect(memoryInbox.getByLabel("Rejected memory candidates").getByText("Rejected in local memory inbox.")).toBeVisible();
  await memoryInbox.locator('section,details').filter({ hasText: "1 rejected local memory" }).getByRole("button", { name: "Restore" }).click();
  await expect(memoryInbox.getByRole("heading", { name: "6 active local memories" })).toBeVisible();
  await expect(memoryCounts.getByText("0 rejected")).toBeVisible();
  await memoryInbox.locator(".memory-item").last().getByRole("button", { name: "Delete" }).click();
  await expect(memoryInbox.getByRole("heading", { name: "5 active local memories" })).toBeVisible();

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

  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Local app truth and data controls." })).toBeVisible();
  await expect(page.getByText("Export, import, and reset apply only to this browser demo state.")).toBeVisible();
  await expect(page.getByLabel("Local data summary").getByText("Review")).toBeVisible();
  await expect(page.getByLabel("Restart: saved")).toBeVisible();
  await expect(page.getByLabel("Rescue: saved")).toBeVisible();
  await expect(page.getByLabel("Experiment observations: 1")).toBeVisible();
  await expect(page.getByLabel("Local data summary").getByText("Active memories")).toBeVisible();
  await expect(page.getByLabel("Local data summary").getByText("Kept memories")).toBeVisible();
  await expect(page.getByLabel("Local data summary").getByText("Rejected memories")).toBeVisible();
  await expect(page.getByLabel("Local data summary").getByText("Day history")).toBeVisible();
  await expect(page.getByLabel("Local data summary").getByText("History insight")).toBeVisible();
  await expect(page.getByLabel("Local data summary").getByText("1 checkpoint")).toBeVisible();
  await expect(page.getByLabel("Local history insight").getByRole("heading", { name: "One checkpoint, not a trend yet" })).toBeVisible();
  await expect(page.getByLabel("Local day history").getByRole("heading", { name: "1 local day archived" })).toBeVisible();
  await expect(page.getByLabel("Local data summary").getByText("saved")).toHaveCount(5);
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("download-local-export").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^lifemax-local-demo-export-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByRole("status")).toContainText("Download prepared");
  await page.getByText("View local export preview").click();
  await expect(page.getByLabel("Local export preview").getByText("lifemax.local_demo_export.v1")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("Draft the client note")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("quick_restart")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("Missed yesterday after travel")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("midday_rescue")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("Messages scattered the plan")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("morning walk after breakfast")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("less friction")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("reviewed_at")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("day_archives")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("\"day_archives\": 1")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("\"history_insight\": \"checkpoint\"")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("Walk before opening messages")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("Morning block felt cleaner")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("\"experiment_decision\": \"keep\"")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("Keep the protected first block")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("experiment_observations")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("Protected first block worked")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("\"kept_memories\": 1")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("\"rejected_memories\": 0")).toBeVisible();
  await expect(page.getByLabel("Local export preview").getByText("\"memory_candidates\": 4")).toBeVisible();
  const exportJson = await page.getByLabel("Local export preview").locator("pre").innerText();
  await expect(page.getByTestId("import-local-export")).toBeDisabled();
  await page.getByTestId("import-local-json").fill("{ not valid json");
  await page.getByTestId("import-local-export").click();
  await expect(page.locator(".export-status")).toContainText("Import JSON could not be parsed");
  await page.getByTestId("reset-local").click();
  await expect(page.getByLabel("Confirm local reset")).toBeVisible();
  await page.getByTestId("cancel-reset-local").click();
  await expect(page.getByLabel("Confirm local reset")).toHaveCount(0);
  await expect(page.getByLabel("Check-in: saved")).toBeVisible();
  await page.getByTestId("reset-local").click();
  await page.getByTestId("confirm-reset-local").click();
  await expect(page.locator(".export-status")).toContainText("Local demo data cleared");
  await expect(page.getByLabel("Check-in: empty")).toBeVisible();
  await page.getByTestId("import-local-json").fill(exportJson);
  await page.getByTestId("import-local-export").click();
  await expect(page.locator(".export-status")).toContainText("Imported browser-local demo data");
  await expect(page.getByLabel("Captures: 1")).toBeVisible();
  await expect(page.getByLabel("Active memories: 4")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Local data summary").getByText("Draft the client note")).toHaveCount(0);
  await expect(page.getByLabel("Captures: 1")).toBeVisible();
  await expect(page.getByLabel("Experiment observations: 1")).toBeVisible();
  await page.getByText("View local export preview").click();
  await expect(page.getByLabel("Local export preview").getByText("morning walk after breakfast")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: path.join(highFunctionalityDir, "local-profile-export-mobile-390.png"),
    fullPage: true
  });

  expect(runtimeErrors()).toEqual([]);
});

test("local focus block completes a generated plan item and creates a capture", async ({ page }) => {
  mkdirSync(highFunctionalityDir, { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByTestId("start-focus-block")).toBeDisabled();
  await page.getByLabel("One restart priority").fill("Open the client draft");
  await page.getByLabel("What changed").fill("Travel broke the morning loop");
  await page.getByTestId("save-quick-restart").click();
  await expect(page.getByRole("heading", { name: "Quick restart saved." })).toBeVisible();
  await page.getByTestId("generate-local-plan").click();
  await expect(page.getByLabel("Daily plan editor").getByLabel("Must-do")).toHaveValue("Open the client draft");

  await page.getByTestId("start-focus-block").click();
  await expect(page.getByLabel("Plan focus block").getByRole("heading", { name: "Focus block active." })).toBeVisible();
  await page.getByLabel("Completion note").fill("Finished the client draft without opening messages.");
  await page.getByTestId("complete-focus-block").click();
  await expect(page.getByLabel("Plan focus block").getByRole("heading", { name: "Focus block completed." })).toBeVisible();
  await expect(page.getByLabel("Daily plan editor").getByText("1/3 done")).toBeVisible();
  await page.locator('section[aria-label="Plan focus block"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Plan focus block"]').screenshot({
    path: path.join(highFunctionalityDir, "local-focus-block-completed-mobile-390.png")
  });
  await page.reload();
  await expect(page.getByLabel("Plan focus block").getByRole("heading", { name: "Focus block completed." })).toBeVisible();
  await expect(page.getByLabel("Daily plan editor").getByText("1/3 done")).toBeVisible();
  await page.goto("/capture");
  await expect(page.getByLabel("Capture list").getByLabel("Capture: Focus block: Open the client draft")).toBeVisible();
  await page.locator('section[aria-label="Capture list"]').evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.locator('section[aria-label="Capture list"]').screenshot({
    path: path.join(highFunctionalityDir, "local-focus-capture-mobile-390.png")
  });
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
