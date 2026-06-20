import { describe, expect, test } from "vitest";
import packageJson from "../package.json";
import commandMatrix from "../command-matrix.json";
import { forbiddenWave0Dependencies, tabs, wave0CommandIds } from "../lib/contracts";
import { emptyTodayState } from "../lib/demo-state";
import {
  createDayArchive,
  createInitialLocalDemoState,
  createLocalDemoExport,
  createSuggestedPlan,
  deriveTodayView,
  readStoredLocalDemoState,
  type LocalDemoState
} from "../lib/local-demo-state";

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

  test("derives local demo state without claiming backend readiness", () => {
    const emptyView = deriveTodayView(createInitialLocalDemoState());

    expect(emptyView.state).toBe("uncertain");
    expect(emptyView.confidence).toBe("low");
    expect(emptyView.freshness_summary.find((source) => source.label === "Health integrations")?.status).toBe("disabled");
    expect(emptyView.history_insight.status).toBe("empty");

    const withLocalSignals: LocalDemoState = {
      schema_version: "lifemax.local_demo.v1",
      check_in: {
        energy: "ok",
        mood: "ok",
        stress: "medium",
        body: "ok",
        friction_tags: ["good momentum"],
        note: "",
        saved_at: "2026-06-19T18:00:00.000Z"
      },
      captures: [
        {
          id: "capture-test",
          kind: "habit",
          label: "morning walk",
          note: "",
          impact: "helped",
          created_at: "2026-06-19T18:05:00.000Z",
          updated_at: "2026-06-19T18:05:00.000Z"
        }
      ],
      daily_plan: null,
      midday_rescue: null,
      quick_restart: null,
      evening_close: null,
      memory_candidates: [],
      pattern_decisions: [],
      experiment: null,
      day_archives: [],
      reviewed_at: null,
      plan_done: false,
      lowered_today: false,
      experiment_started_at: null,
      updated_at: "2026-06-19T18:05:00.000Z"
    };

    const signalView = deriveTodayView(withLocalSignals);
    expect(signalView.confidence).toBe("medium");
    expect(signalView.pattern_summary.ready).toBe(true);
    expect(signalView.rescue_summary.status).toBe("open");
    expect(signalView.plan_summary.status).toBe("missing");
    expect(signalView.day_review.status).toBe("locked");
    expect(signalView.day_review.missing_inputs).toContain("saved plan");
    expect(signalView.pattern_cards[0]?.evidence_count).toBeGreaterThanOrEqual(2);
    expect(signalView.freshness_summary.find((source) => source.label === "Health integrations")?.status).toBe("disabled");
  });

  test("derives the higher-functionality local daily loop", () => {
    const plan = createSuggestedPlan(false, "2026-06-19T18:00:00.000Z");
    const state: LocalDemoState = {
      schema_version: "lifemax.local_demo.v1",
      check_in: {
        energy: "ok",
        mood: "ok",
        stress: "medium",
        body: "ok",
        friction_tags: ["schedule friction"],
        note: "manual day loop",
        saved_at: "2026-06-19T18:00:00.000Z"
      },
      captures: [
        {
          id: "capture-test",
          kind: "habit",
          label: "morning walk",
          note: "felt easier after breakfast",
          impact: "helped",
          created_at: "2026-06-19T18:05:00.000Z",
          updated_at: "2026-06-19T18:05:00.000Z"
        }
      ],
      daily_plan: {
        ...plan,
        must_do: "Draft the client note",
        item_statuses: {
          must_do: "done",
          optional_1: "open",
          optional_2: "skipped"
        }
      },
      midday_rescue: {
        trigger: "overloaded",
        reset: "walk",
        next_move: "Walk without messages",
        defer_until: "after lunch",
        note: "Messages scattered the plan",
        saved_at: "2026-06-19T19:10:00.000Z"
      },
      quick_restart: {
        window: "one_day",
        energy: "low",
        sleep: "rough",
        priority: "Draft the client note",
        changed: "Missed yesterday after travel",
        reminder_stance: "none_today",
        saved_at: "2026-06-19T17:45:00.000Z"
      },
      evening_close: {
        completed: "Client note drafted",
        missed: "Walk moved",
        why: "Afternoon friction",
        recovery_impact: "neutral",
        tomorrow_hint: "Walk before messages",
        saved_at: "2026-06-19T20:30:00.000Z"
      },
      memory_candidates: [
        {
          id: "memory-test",
          title: "Walk before messages",
          detail: "Afternoon friction",
          source: "evening_close",
          status: "kept",
          created_at: "2026-06-19T20:30:00.000Z",
          updated_at: "2026-06-19T20:31:00.000Z",
          rejection_reason: null
        }
      ],
      pattern_decisions: [
        {
          pattern_id: "local-pattern-energy",
          status: "watching",
          updated_at: "2026-06-19T20:31:00.000Z"
        }
      ],
      experiment: {
        id: "experiment-test",
        pattern_id: "local-pattern-energy",
        hypothesis: "Morning walk may reduce friction",
        intervention: "Walk before messages",
        target_signal: "energy",
        minimum_window_days: 3,
        stop_condition: "Stop if it adds pressure",
        status: "active",
        started_at: "2026-06-19T20:32:00.000Z",
        stopped_at: null,
        result_note: null,
        observations: [
          {
            id: "observation-test",
            signal: "better",
            note: "Morning block felt cleaner",
            captured_at: "2026-06-19T20:45:00.000Z"
          }
        ]
      },
      day_archives: [],
      reviewed_at: null,
      plan_done: false,
      lowered_today: false,
      experiment_started_at: "2026-06-19T20:32:00.000Z",
      updated_at: "2026-06-19T20:32:00.000Z"
    };

    const view = deriveTodayView(state);

    expect(view.plan_summary.progress_label).toBe("1/3 done");
    expect(view.restart_summary.status).toBe("saved");
    expect(view.restart_summary.priority).toBe("Draft the client note");
    expect(view.rescue_summary.status).toBe("saved");
    expect(view.rescue_summary.detail).toContain("Walk without messages");
    expect(view.evening_summary.status).toBe("closed");
    expect(view.memory_summary.latest?.title).toBe("Walk before messages");
    expect(view.pattern_cards.find((card) => card.id === "local-pattern-energy")?.decision).toBe("watching");
    expect(view.experiment_summary.status).toBe("active");
    expect(view.experiment_summary.detail).toContain("1 observation logged");
    expect(view.day_review.status).toBe("ready");
    expect(view.day_review.evidence_count).toBeGreaterThanOrEqual(8);
    expect(view.day_review.risk_flags).toContain("quick restart used");
    expect(view.day_review.risk_flags).toContain("midday rescue used");
    expect(view.day_review.tomorrow_cue).toBe("Walk before messages");
    expect(view.day_review.risk_flags).toContain("health integrations disabled");
    expect(view.day_history_summary.count).toBe(0);
    expect(view.freshness_summary.find((source) => source.label === "Health integrations")?.status).toBe("disabled");
  });

  test("exports only browser-local demo state with an explicit boundary", () => {
    const state: LocalDemoState = {
      ...createInitialLocalDemoState(),
      check_in: {
        energy: "ok",
        mood: "ok",
        stress: "medium",
        body: "ok",
        friction_tags: [],
        note: "local only",
        saved_at: "2026-06-19T18:00:00.000Z"
      },
      captures: [
        {
          id: "capture-export-test",
          kind: "note",
          label: "export proof",
          note: "",
          impact: "uncertain",
          created_at: "2026-06-19T18:05:00.000Z",
          updated_at: "2026-06-19T18:05:00.000Z"
        }
      ],
      updated_at: "2026-06-19T18:05:00.000Z"
    };

    const localExport = createLocalDemoExport(state, "2026-06-20T05:30:00.000Z");

    expect(localExport.schema_version).toBe("lifemax.local_demo_export.v1");
    expect(localExport.summary.check_in).toBe("saved");
    expect(localExport.summary.captures).toBe(1);
    expect(localExport.summary.rescue).toBe("open");
    expect(localExport.summary.restart).toBe("open");
    expect(localExport.summary.review).toBe("open");
    expect(localExport.summary.day_archives).toBe(0);
    expect(localExport.summary.history_insight).toBe("empty");
    expect(localExport.summary.experiment_observations).toBe(0);
    expect(localExport.truth_boundary.join(" ")).toContain("browser-local LifeMax demo data only");
    expect(localExport.truth_boundary.join(" ")).toContain("does not include WHOOP");
    expect(localExport.state.captures[0]?.label).toBe("export proof");
  });

  test("archives a completed local day without implying backend storage", () => {
    const plan = createSuggestedPlan(false, "2026-06-19T18:00:00.000Z");
    const state: LocalDemoState = {
      ...createInitialLocalDemoState(),
      check_in: {
        energy: "ok",
        mood: "ok",
        stress: "medium",
        body: "ok",
        friction_tags: ["schedule friction"],
        note: "archive proof",
        saved_at: "2026-06-19T18:00:00.000Z"
      },
      captures: [
        {
          id: "capture-archive-test",
          kind: "habit",
          label: "morning walk",
          note: "felt easier",
          impact: "helped",
          created_at: "2026-06-19T18:05:00.000Z",
          updated_at: "2026-06-19T18:05:00.000Z"
        }
      ],
      daily_plan: {
        ...plan,
        must_do: "Draft the client note",
        item_statuses: {
          must_do: "done",
          optional_1: "open",
          optional_2: "skipped"
        }
      },
      evening_close: {
        completed: "Client note drafted",
        missed: "Walk moved",
        why: "Afternoon friction",
        recovery_impact: "neutral",
        tomorrow_hint: "Walk before messages",
        saved_at: "2026-06-19T20:30:00.000Z"
      },
      updated_at: "2026-06-19T20:30:00.000Z"
    };
    const view = deriveTodayView(state);
    const archive = createDayArchive(state, view.day_review, "2026-06-20T05:30:00.000Z");
    const stored = readStoredLocalDemoState(
      JSON.stringify({
        ...state,
        day_archives: [archive]
      })
    );
    const localExport = createLocalDemoExport(stored, "2026-06-20T05:35:00.000Z");
    const checkpointView = deriveTodayView(stored);
    const secondArchive = {
      ...archive,
      id: "day-archive-second-proof",
      archived_at: "2026-06-21T05:30:00.000Z",
      day_label: "Jun 21",
      evidence_count: 4,
      plan_progress: "2/3 done",
      capture_count: 2,
      experiment_observation_count: 1,
      rescue_used: true,
      tomorrow_cue: "Walk before messages"
    };
    const emergingView = deriveTodayView({
      ...stored,
      day_archives: [secondArchive, ...stored.day_archives]
    });
    const thirdArchive = {
      ...archive,
      id: "day-archive-third-proof",
      archived_at: "2026-06-22T05:30:00.000Z",
      day_label: "Jun 22",
      evidence_count: 5,
      plan_progress: "3/3 done",
      capture_count: 2,
      experiment_observation_count: 1,
      rescue_used: false,
      tomorrow_cue: "Walk before messages"
    };
    const trendView = deriveTodayView({
      ...stored,
      day_archives: [thirdArchive, secondArchive, ...stored.day_archives]
    });

    expect(view.day_review.status).toBe("ready");
    expect(archive.tomorrow_cue).toBe("Walk before messages");
    expect(archive.plan_progress).toBe("1/3 done");
    expect(archive.capture_count).toBe(1);
    expect(stored.day_archives[0]?.review_summary).toContain("1 capture");
    expect(checkpointView.day_history_summary.count).toBe(1);
    expect(checkpointView.day_history_summary.detail).toContain("Walk before messages");
    expect(checkpointView.history_insight.status).toBe("checkpoint");
    expect(checkpointView.history_insight.next_action).toContain("one more closed day");
    expect(emergingView.history_insight.status).toBe("emerging");
    expect(emergingView.history_insight.title).toContain("still early");
    expect(trendView.history_insight.status).toBe("trend");
    expect(trendView.history_insight.detail).toContain("plan items completed");
    expect(trendView.history_insight.next_action).toContain("Walk before messages");
    expect(localExport.summary.day_archives).toBe(1);
    expect(localExport.summary.history_insight).toBe("checkpoint");
    expect(localExport.truth_boundary.join(" ")).toContain("browser-local LifeMax demo data only");
  });

  test("normalizes legacy and malformed capture records into editable local evidence", () => {
    const stored = readStoredLocalDemoState(
      JSON.stringify({
        ...createInitialLocalDemoState(),
        captures: [
          {
            id: "legacy-capture",
            kind: "habit",
            label: "legacy walk",
            note: "old record without updated_at",
            impact: "helped",
            created_at: "2026-06-19T18:05:00.000Z"
          },
          {
            id: "malformed-capture",
            kind: "mystery",
            label: "",
            note: "kept from note",
            impact: "huge",
            created_at: "2026-06-19T18:10:00.000Z"
          }
        ],
        updated_at: "2026-06-19T18:10:00.000Z"
      })
    );

    expect(stored.captures[0]?.updated_at).toBe("2026-06-19T18:05:00.000Z");
    expect(stored.captures[1]?.kind).toBe("note");
    expect(stored.captures[1]?.impact).toBe("uncertain");
    expect(stored.captures[1]?.label).toBe("Note");
    expect(deriveTodayView(stored).freshness_summary.find((source) => source.label === "Local captures")?.detail).toContain("2 events");
  });

  test("normalizes and summarizes local memory review state without backend claims", () => {
    const stored = readStoredLocalDemoState(
      JSON.stringify({
        ...createInitialLocalDemoState(),
        memory_candidates: [
          {
            id: "legacy-memory",
            title: "Walk before messages",
            detail: "Legacy candidate without status",
            source: "evening_close",
            created_at: "2026-06-19T20:30:00.000Z"
          },
          {
            id: "rejected-memory",
            title: "Ignore noisy late-night cue",
            detail: "Rejected because it added pressure.",
            source: "pattern",
            status: "rejected",
            created_at: "2026-06-19T20:31:00.000Z",
            updated_at: "2026-06-19T20:32:00.000Z",
            rejection_reason: "Rejected in local memory inbox."
          },
          {
            id: "kept-memory",
            title: "Protect first block",
            detail: "Kept after review.",
            source: "experiment",
            status: "kept",
            created_at: "2026-06-19T20:33:00.000Z",
            updated_at: "2026-06-19T20:34:00.000Z",
            rejection_reason: null
          }
        ],
        updated_at: "2026-06-19T20:34:00.000Z"
      })
    );

    const view = deriveTodayView(stored);
    const localExport = createLocalDemoExport(stored, "2026-06-20T05:30:00.000Z");

    expect(stored.memory_candidates[0]?.status).toBe("candidate");
    expect(stored.memory_candidates[0]?.updated_at).toBe("2026-06-19T20:30:00.000Z");
    expect(view.memory_summary.count).toBe(2);
    expect(view.memory_summary.candidate_count).toBe(1);
    expect(view.memory_summary.kept_count).toBe(1);
    expect(view.memory_summary.rejected_count).toBe(1);
    expect(view.memory_summary.latest?.title).toBe("Walk before messages");
    expect(localExport.summary.memories).toBe(2);
    expect(localExport.summary.memory_candidates).toBe(3);
    expect(localExport.summary.kept_memories).toBe(1);
    expect(localExport.summary.rejected_memories).toBe(1);
    expect(localExport.truth_boundary.join(" ")).toContain("browser-local LifeMax demo data only");
  });

  test("defaults unknown local memory status back to a reviewable candidate", () => {
    const stored = readStoredLocalDemoState(
      JSON.stringify({
        ...createInitialLocalDemoState(),
        memory_candidates: [
          {
            id: "unknown-status-memory",
            title: "Unknown status should be reviewable",
            detail: "Future or malformed statuses must not disappear.",
            source: "restart",
            status: "archived",
            created_at: "2026-06-19T20:30:00.000Z"
          }
        ]
      })
    );

    expect(stored.memory_candidates[0]?.status).toBe("candidate");
    expect(deriveTodayView(stored).memory_summary.candidate_count).toBe(1);
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
