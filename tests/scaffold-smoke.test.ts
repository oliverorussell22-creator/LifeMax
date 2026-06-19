import { describe, expect, test } from "vitest";
import packageJson from "../package.json";
import commandMatrix from "../command-matrix.json";
import { forbiddenWave0Dependencies, tabs, wave0CommandIds } from "../lib/contracts";
import { emptyTodayState } from "../lib/demo-state";

describe("Wave 0 scaffold contract", () => {
  test("keeps canonical five-tab navigation stable", () => {
    expect(tabs.map((tab) => tab.label)).toEqual(["Today", "Capture", "Patterns", "Experiments", "Profile"]);
    expect(tabs.map((tab) => tab.href)).toEqual(["/today", "/capture", "/patterns", "/experiments", "/profile"]);
  });

  test("uses no fake source data in empty Today state", () => {
    expect(emptyTodayState.schema_version).toBe("today.v1");
    expect(emptyTodayState.confidence).toBe("low");
    expect(emptyTodayState.freshness_summary.every((source) => ["missing", "disabled"].includes(source.status))).toBe(true);
    expect(emptyTodayState.freshness_summary.some((source) => source.source_kind === "goose_helper")).toBe(true);
  });

  test("declares every required Wave 0 command", () => {
    const scriptNames = Object.keys(packageJson.scripts);
    for (const commandId of wave0CommandIds) {
      if (commandId === "install") {
        continue;
      }
      expect(scriptNames).toContain(commandId);
    }

    expect(commandMatrix.commands.map((command) => command.id)).toEqual([
      "install",
      "dev",
      "build",
      "typecheck",
      "lint",
      "test",
      "test_pwa",
      "test_fixtures",
      "screenshot_mobile"
    ]);
  });

  test("does not add forbidden Wave 0 runtime dependencies", () => {
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    for (const forbidden of forbiddenWave0Dependencies) {
      expect(Object.keys(allDependencies).some((name) => name.toLowerCase().includes(forbidden))).toBe(false);
    }
  });
});
