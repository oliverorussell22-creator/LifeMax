import { describe, expect, test } from "vitest";
import commandMatrix from "../../command-matrix.json";
import { emptyTodayState } from "../../lib/demo-state";

describe("local fixture contracts", () => {
  test("records evidence paths for scaffold commands", () => {
    for (const command of commandMatrix.commands) {
      expect(command.command).toMatch(/^(npm|node) /);
      expect(command.required_for_stage).toBe("vercel_ready_shell");
      expect(command.evidence_path).toBeTruthy();
    }
  });

  test("protects low-confidence no-wearable path", () => {
    expect(emptyTodayState.state).toBe("uncertain");
    expect(emptyTodayState.intensity_cap).toBeLessThanOrEqual(1);
    expect(emptyTodayState.recommended_move.kind).toBe("check_in");
  });
});
