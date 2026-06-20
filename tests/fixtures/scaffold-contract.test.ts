import { describe, expect, test } from "vitest";
import commandMatrix from "../../command-matrix.json";
import { emptyTodayState } from "../../lib/demo-state";

describe("local fixture contracts", () => {
  test("records evidence paths for standalone app commands", () => {
    for (const command of commandMatrix.commands) {
      expect(command.command).toMatch(/^(npm|node) /);
      expect(["vercel_ready_app", "local_review", "browser_visual_smoke"]).toContain(command.required_for_stage);
      expect(command.evidence_path).toBeTruthy();
    }
  });

  test("protects low-confidence no-wearable path", () => {
    expect(emptyTodayState.state).toBe("uncertain");
    expect(emptyTodayState.intensity_cap).toBeLessThanOrEqual(1);
    expect(emptyTodayState.recommended_move.kind).toBe("check_in");
  });
});
