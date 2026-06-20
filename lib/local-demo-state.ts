import type { Confidence, FreshnessStatus, LifeState } from "./contracts";

export const localDemoStorageKey = "lifemax.localDemo.v1";

export type SignalLevel = "low" | "ok" | "strong";
export type StressLevel = "low" | "medium" | "high";
export type BodyLevel = "rough" | "ok" | "good";
export type CaptureKind = "supplement" | "habit" | "symptom" | "hydration" | "note";
export type CaptureImpact = "helped" | "neutral" | "drained" | "uncertain";
export type PlanItemStatus = "open" | "done" | "skipped";
export type PlanSlot = "must_do" | "optional_1" | "optional_2";
export type RecoveryImpact = "restored" | "neutral" | "draining";
export type PatternDecisionStatus = "watching" | "confirmed" | "rejected";
export type ExperimentStatus = "active" | "stopped" | "inconclusive";

export interface LocalCheckIn {
  energy: SignalLevel;
  mood: SignalLevel;
  stress: StressLevel;
  body: BodyLevel;
  friction_tags: string[];
  note: string;
  saved_at: string;
}

export interface CaptureEvent {
  id: string;
  kind: CaptureKind;
  label: string;
  note: string;
  impact: CaptureImpact;
  created_at: string;
}

export interface LocalDailyPlan {
  must_do: string;
  optional_1: string;
  optional_2: string;
  avoid_today: string;
  shutdown_target: string;
  item_statuses: Record<PlanSlot, PlanItemStatus>;
  accepted_at: string;
  updated_at: string;
}

export interface EveningClose {
  completed: string;
  missed: string;
  why: string;
  recovery_impact: RecoveryImpact;
  tomorrow_hint: string;
  saved_at: string;
}

export interface MemoryCandidate {
  id: string;
  title: string;
  detail: string;
  source: "evening_close" | "pattern" | "experiment";
  created_at: string;
}

export interface PatternDecision {
  pattern_id: string;
  status: PatternDecisionStatus;
  updated_at: string;
}

export interface LocalExperiment {
  id: string;
  pattern_id: string;
  hypothesis: string;
  intervention: string;
  target_signal: string;
  minimum_window_days: number;
  stop_condition: string;
  status: ExperimentStatus;
  started_at: string;
  stopped_at: string | null;
  result_note: string | null;
}

export interface LocalDemoState {
  schema_version: "lifemax.local_demo.v1";
  check_in: LocalCheckIn | null;
  captures: CaptureEvent[];
  daily_plan: LocalDailyPlan | null;
  evening_close: EveningClose | null;
  memory_candidates: MemoryCandidate[];
  pattern_decisions: PatternDecision[];
  experiment: LocalExperiment | null;
  plan_done: boolean;
  lowered_today: boolean;
  experiment_started_at: string | null;
  updated_at: string | null;
}

export interface LocalDemoExport {
  schema_version: "lifemax.local_demo_export.v1";
  generated_at: string;
  storage_key: typeof localDemoStorageKey;
  truth_boundary: string[];
  summary: {
    check_in: "saved" | "empty";
    plan: "saved" | "empty";
    close: "saved" | "open";
    captures: number;
    memories: number;
    pattern_decisions: number;
    experiment: ExperimentStatus | "none";
  };
  state: LocalDemoState;
}

export interface DerivedTodayView {
  state: LifeState;
  confidence: Confidence;
  intensity_cap: 0 | 1 | 2 | 3;
  primary_reason: string;
  recommended_move: {
    title: string;
    reason: string;
  };
  recovery_boundary: {
    title: string;
    detail: string;
  };
  plan_items: string[];
  plan_summary: {
    status: "missing" | "open" | "in_progress" | "complete" | "skipped";
    progress_label: string;
    completed_count: number;
    active_count: number;
    next_item: string | null;
    avoid_today: string;
    shutdown_target: string;
  };
  suggested_plan: LocalDailyPlan;
  evening_summary: {
    status: "open" | "closed";
    title: string;
    detail: string;
  };
  memory_summary: {
    count: number;
    latest: MemoryCandidate | null;
  };
  freshness_summary: Array<{
    label: string;
    status: FreshnessStatus;
    detail: string;
  }>;
  pattern_cards: PatternCard[];
  pattern_summary: {
    title: string;
    detail: string;
    ready: boolean;
  };
  experiment_summary: {
    status: "locked" | "ready" | "active" | "stopped" | "inconclusive";
    title: string;
    detail: string;
  };
}

export interface PatternCard {
  id: string;
  title: string;
  confidence: Confidence;
  evidence_count: number;
  window_label: string;
  confounders: string[];
  suggested_action: "keep_watching" | "start_experiment" | "review_close";
  decision: PatternDecisionStatus | null;
}

export function createInitialLocalDemoState(): LocalDemoState {
  return {
    schema_version: "lifemax.local_demo.v1",
    check_in: null,
    captures: [],
    daily_plan: null,
    evening_close: null,
    memory_candidates: [],
    pattern_decisions: [],
    experiment: null,
    plan_done: false,
    lowered_today: false,
    experiment_started_at: null,
    updated_at: null
  };
}

export function createLocalDemoExport(state: LocalDemoState, generatedAt: string): LocalDemoExport {
  return {
    schema_version: "lifemax.local_demo_export.v1",
    generated_at: generatedAt,
    storage_key: localDemoStorageKey,
    truth_boundary: [
      "This export contains browser-local LifeMax demo data only.",
      "It does not include WHOOP, account, hosted AI, Telegram, n8n, public MCP, Grok, Postgres, or backend records.",
      "Exporting does not delete local browser data."
    ],
    summary: {
      check_in: state.check_in ? "saved" : "empty",
      plan: state.daily_plan ? "saved" : "empty",
      close: state.evening_close ? "saved" : "open",
      captures: state.captures.length,
      memories: state.memory_candidates.length,
      pattern_decisions: state.pattern_decisions.length,
      experiment: state.experiment?.status ?? "none"
    },
    state
  };
}

export function serializeLocalDemoExport(state: LocalDemoState, generatedAt: string): string {
  return JSON.stringify(createLocalDemoExport(state, generatedAt), null, 2);
}

export function readStoredLocalDemoState(raw: string | null): LocalDemoState {
  if (!raw) return createInitialLocalDemoState();

  try {
    const parsed = JSON.parse(raw) as Partial<LocalDemoState>;
    if (parsed.schema_version !== "lifemax.local_demo.v1") return createInitialLocalDemoState();

    return {
      schema_version: "lifemax.local_demo.v1",
      check_in: parsed.check_in ?? null,
      captures: Array.isArray(parsed.captures)
        ? parsed.captures.slice(0, 50).map((capture) => ({
            id: capture.id,
            kind: capture.kind,
            label: capture.label,
            note: capture.note ?? "",
            impact: capture.impact ?? "uncertain",
            created_at: capture.created_at
          }))
        : [],
      daily_plan: normalizeDailyPlan(parsed.daily_plan),
      evening_close: normalizeEveningClose(parsed.evening_close),
      memory_candidates: Array.isArray(parsed.memory_candidates) ? parsed.memory_candidates.slice(0, 25) : [],
      pattern_decisions: Array.isArray(parsed.pattern_decisions) ? parsed.pattern_decisions.slice(0, 20) : [],
      experiment: normalizeExperiment(parsed.experiment, parsed.experiment_started_at ?? null),
      plan_done: Boolean(parsed.plan_done),
      lowered_today: Boolean(parsed.lowered_today),
      experiment_started_at: parsed.experiment_started_at ?? null,
      updated_at: parsed.updated_at ?? null
    };
  } catch {
    return createInitialLocalDemoState();
  }
}

export function deriveTodayView(state: LocalDemoState): DerivedTodayView {
  const hasCheckIn = Boolean(state.check_in);
  const lowEnergy = state.check_in?.energy === "low";
  const highStress = state.check_in?.stress === "high";
  const roughBody = state.check_in?.body === "rough";
  const protective = state.lowered_today || lowEnergy || highStress || roughBody;
  const captureCount = state.captures.length;
  const suggestedPlan = createSuggestedPlan(protective, state.daily_plan?.accepted_at ?? state.updated_at);
  const activePlan = state.daily_plan ?? suggestedPlan;
  const planSummary = summarizePlan(state.daily_plan);
  const patternCards = buildPatternCards(state);
  const latestMemory = state.memory_candidates[0] ?? null;

  if (!hasCheckIn) {
    return {
      state: "uncertain",
      confidence: "low",
      intensity_cap: 1,
      primary_reason: "LifeMax has no local check-in for today yet.",
      recommended_move: {
        title: "Do a 30-second check-in.",
        reason: "One manual signal is enough to build a local plan without wearable data."
      },
      recovery_boundary: {
        title: "No current signal means no pressure.",
        detail: "LifeMax will not infer readiness from missing sources."
      },
      plan_items: ["Check in", "Capture one useful note if something changes", "Review again tonight"],
      plan_summary: {
        status: "missing",
        progress_label: "No plan accepted yet",
        completed_count: 0,
        active_count: 0,
        next_item: null,
        avoid_today: activePlan.avoid_today,
        shutdown_target: activePlan.shutdown_target
      },
      suggested_plan: activePlan,
      evening_summary: summarizeEveningClose(state.evening_close),
      memory_summary: {
        count: state.memory_candidates.length,
        latest: latestMemory
      },
      freshness_summary: freshnessSummary("missing", captureCount, state.updated_at),
      pattern_cards: patternCards,
      pattern_summary: {
        title: "No pattern candidates yet",
        detail: "Save a check-in and at least one capture before LifeMax shows a local pattern.",
        ready: false
      },
      experiment_summary: summarizeExperiment(state.experiment, false)
    };
  }

  return {
    state: protective ? "low_energy" : "steady",
    confidence: captureCount > 0 ? "medium" : "medium",
    intensity_cap: state.lowered_today ? 1 : protective ? 1 : 2,
    primary_reason: protective
      ? "Manual check-in points to a smaller day. No wearable data was used."
      : "Manual check-in is fresh. Confidence stays medium until source integrations are proven.",
    recommended_move: {
      title: protective ? "Keep the plan small." : "Create a small plan for today.",
      reason: protective
        ? "A lower intensity cap protects the day from turning into a productivity push."
        : "The local check-in is enough to choose one next action."
    },
    recovery_boundary: {
      title: state.lowered_today ? "Intensity was lowered by you." : "Manual data is useful but limited.",
      detail: state.lowered_today
        ? "LifeMax will keep suggestions conservative for this local demo day."
        : "Missing integrations keep confidence capped; this is not a medical assessment."
    },
    plan_items: protective
      ? ["Pick one must-do", "Capture symptoms, supplements, or friction", "Close the loop tonight"]
      : ["Pick one useful task", "Capture what changes energy", "Review patterns after repeated signals"],
    plan_summary: planSummary,
    suggested_plan: activePlan,
    evening_summary: summarizeEveningClose(state.evening_close),
    memory_summary: {
      count: state.memory_candidates.length,
      latest: latestMemory
    },
    freshness_summary: freshnessSummary("fresh", captureCount, state.updated_at),
    pattern_cards: patternCards,
    pattern_summary:
      captureCount > 0
        ? {
            title: `${captureCount} local signal${captureCount === 1 ? "" : "s"} ready to watch`,
            detail: "LifeMax can show an emerging pattern candidate, but not a causal claim.",
            ready: true
          }
        : {
            title: "Check-in saved; capture still empty",
            detail: "Add one capture so Patterns and Experiments have something to derive from.",
            ready: false
          },
    experiment_summary: summarizeExperiment(state.experiment, captureCount > 0)
  };
}

export function createSuggestedPlan(protective = false, timestamp: string | null = null): LocalDailyPlan {
  const now = timestamp ?? new Date().toISOString();

  return {
    must_do: protective ? "Choose the one thing that keeps today intact" : "Pick one useful task",
    optional_1: protective ? "Capture symptoms, supplements, or friction" : "Capture what changes energy",
    optional_2: protective ? "Close the loop tonight" : "Review patterns after repeated signals",
    avoid_today: protective ? "Do not turn recovery into a productivity push" : "Do not add a second major priority",
    shutdown_target: "8:30 PM",
    item_statuses: {
      must_do: "open",
      optional_1: "open",
      optional_2: "open"
    },
    accepted_at: now,
    updated_at: now
  };
}

function normalizeDailyPlan(value: unknown): LocalDailyPlan | null {
  if (!value || typeof value !== "object") return null;
  const plan = value as Partial<LocalDailyPlan>;
  if (!plan.must_do || !plan.accepted_at || !plan.updated_at) return null;

  return {
    must_do: plan.must_do,
    optional_1: plan.optional_1 ?? "",
    optional_2: plan.optional_2 ?? "",
    avoid_today: plan.avoid_today ?? "Do not add pressure without a reason",
    shutdown_target: plan.shutdown_target ?? "8:30 PM",
    item_statuses: {
      must_do: plan.item_statuses?.must_do ?? "open",
      optional_1: plan.item_statuses?.optional_1 ?? "open",
      optional_2: plan.item_statuses?.optional_2 ?? "open"
    },
    accepted_at: plan.accepted_at,
    updated_at: plan.updated_at
  };
}

function normalizeEveningClose(value: unknown): EveningClose | null {
  if (!value || typeof value !== "object") return null;
  const close = value as Partial<EveningClose>;
  if (!close.saved_at) return null;

  return {
    completed: close.completed ?? "",
    missed: close.missed ?? "",
    why: close.why ?? "",
    recovery_impact: close.recovery_impact ?? "neutral",
    tomorrow_hint: close.tomorrow_hint ?? "",
    saved_at: close.saved_at
  };
}

function normalizeExperiment(value: unknown, legacyStartedAt: string | null): LocalExperiment | null {
  if (value && typeof value === "object") {
    const experiment = value as Partial<LocalExperiment>;
    if (experiment.id && experiment.started_at) {
      return {
        id: experiment.id,
        pattern_id: experiment.pattern_id ?? "local-pattern-energy",
        hypothesis: experiment.hypothesis ?? "A smaller morning plan may reduce friction.",
        intervention: experiment.intervention ?? "Protect the first hour and keep one must-do.",
        target_signal: experiment.target_signal ?? "energy and follow-through",
        minimum_window_days: experiment.minimum_window_days ?? 3,
        stop_condition: experiment.stop_condition ?? "Stop if the plan adds pressure or symptoms worsen.",
        status: experiment.status ?? "active",
        started_at: experiment.started_at,
        stopped_at: experiment.stopped_at ?? null,
        result_note: experiment.result_note ?? null
      };
    }
  }

  if (!legacyStartedAt) return null;
  return {
    id: "experiment-legacy",
    pattern_id: "local-pattern-energy",
    hypothesis: "A smaller morning plan may reduce friction.",
    intervention: "Protect the first hour and keep one must-do.",
    target_signal: "energy and follow-through",
    minimum_window_days: 3,
    stop_condition: "Stop if the plan adds pressure or symptoms worsen.",
    status: "active",
    started_at: legacyStartedAt,
    stopped_at: null,
    result_note: null
  };
}

function summarizePlan(plan: LocalDailyPlan | null): DerivedTodayView["plan_summary"] {
  if (!plan) {
    return {
      status: "missing",
      progress_label: "No plan accepted yet",
      completed_count: 0,
      active_count: 0,
      next_item: null,
      avoid_today: "No boundary set yet",
      shutdown_target: "Not set"
    };
  }

  const entries = (
    [
    ["must_do", plan.must_do],
    ["optional_1", plan.optional_1],
    ["optional_2", plan.optional_2]
    ] satisfies Array<[PlanSlot, string]>
  ).filter(([, label]) => Boolean(label.trim()));
  const completedCount = entries.filter(([slot]) => plan.item_statuses[slot] === "done").length;
  const skippedCount = entries.filter(([slot]) => plan.item_statuses[slot] === "skipped").length;
  const activeCount = entries.length - completedCount - skippedCount;
  const nextItem = entries.find(([slot]) => plan.item_statuses[slot] === "open")?.[1] ?? null;
  const status =
    entries.length === 0
      ? "missing"
      : completedCount === entries.length
        ? "complete"
        : activeCount > 0 && completedCount > 0
          ? "in_progress"
          : activeCount === 0
            ? "skipped"
            : "open";

  return {
    status,
    progress_label: `${completedCount}/${entries.length} done`,
    completed_count: completedCount,
    active_count: activeCount,
    next_item: nextItem,
    avoid_today: plan.avoid_today,
    shutdown_target: plan.shutdown_target
  };
}

function summarizeEveningClose(close: EveningClose | null): DerivedTodayView["evening_summary"] {
  if (!close) {
    return {
      status: "open",
      title: "Close the loop tonight.",
      detail: "Capture what worked, what slipped, and one hint for tomorrow."
    };
  }

  return {
    status: "closed",
    title: "Evening close saved.",
    detail: close.tomorrow_hint
      ? `Tomorrow hint: ${close.tomorrow_hint}`
      : "LifeMax has a local memory candidate from today's close."
  };
}

function buildPatternCards(state: LocalDemoState): PatternCard[] {
  const decisions = new Map((state.pattern_decisions ?? []).map((decision) => [decision.pattern_id, decision.status]));
  const cards: PatternCard[] = [];
  const captureCount = state.captures?.length ?? 0;
  const hasClose = Boolean(state.evening_close);

  if (captureCount > 0 || state.check_in) {
    cards.push({
      id: "local-pattern-energy",
      title: captureCount > 1 ? "Energy may follow morning inputs" : "Manual signals are starting to cluster",
      confidence: captureCount >= 3 && hasClose ? "medium" : "low",
      evidence_count: captureCount + (state.check_in ? 1 : 0) + (hasClose ? 1 : 0),
      window_label: "current local day",
      confounders: ["sleep not connected", "wearable data disabled", "manual notes only"],
      suggested_action: captureCount >= 1 ? "start_experiment" : "keep_watching",
      decision: decisions.get("local-pattern-energy") ?? null
    });
  }

  if (hasClose) {
    cards.push({
      id: "local-pattern-close",
      title: "Evening close created a tomorrow cue",
      confidence: "low",
      evidence_count: 1,
      window_label: "latest close",
      confounders: ["single-day note", "no outcome trend yet"],
      suggested_action: "review_close",
      decision: decisions.get("local-pattern-close") ?? null
    });
  }

  return cards;
}

function summarizeExperiment(
  experiment: LocalExperiment | null,
  patternReady: boolean
): DerivedTodayView["experiment_summary"] {
  if (!experiment) {
    return patternReady
      ? {
          status: "ready",
          title: "Ready for one cautious local test.",
          detail: "Use a weak pattern to create a reversible three-day experiment."
        }
      : {
          status: "locked",
          title: "No experiment yet.",
          detail: "Save a check-in and capture before starting a local experiment."
        };
  }

  return {
    status: experiment.status,
    title:
      experiment.status === "active"
        ? experiment.hypothesis
        : experiment.status === "inconclusive"
          ? "Experiment ended inconclusive."
          : "Experiment stopped.",
    detail:
      experiment.status === "active"
        ? `${experiment.minimum_window_days}-day minimum. Target: ${experiment.target_signal}.`
        : experiment.result_note ?? "No result note saved."
  };
}

function freshnessSummary(
  manualStatus: FreshnessStatus,
  captureCount: number,
  updatedAt: string | null
): Array<{ label: string; status: FreshnessStatus; detail: string }> {
  return [
    {
      label: "Manual check-in",
      status: manualStatus,
      detail: updatedAt ? `Saved locally ${formatShortTime(updatedAt)}` : "No check-in captured yet."
    },
    {
      label: "Local captures",
      status: captureCount > 0 ? "fresh" : "missing",
      detail: captureCount > 0 ? `${captureCount} event${captureCount === 1 ? "" : "s"} in this browser` : "No capture events saved."
    },
    {
      label: "Health integrations",
      status: "disabled",
      detail: "WHOOP, accounts, AI, and backend sync are not connected in this app shell."
    }
  ];
}

export function formatShortTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
