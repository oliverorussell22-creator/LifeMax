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
export type ExperimentObservationSignal = "better" | "same" | "worse" | "unclear";
export type RescueTrigger = "drift" | "overloaded" | "body_noise" | "plan_broke";
export type RescueReset = "breathe" | "walk" | "water" | "reduce_input";
export type RestartWindow = "one_day" | "three_days" | "seven_days";
export type RestartSleep = "rough" | "ok" | "good";
export type RestartReminderStance = "none_today" | "evening_only" | "tomorrow";
export type MemoryStatus = "candidate" | "kept" | "rejected";

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
  source: "evening_close" | "pattern" | "experiment" | "rescue" | "restart";
  status: MemoryStatus;
  created_at: string;
  updated_at: string;
  rejection_reason: string | null;
}

export interface MiddayRescue {
  trigger: RescueTrigger;
  reset: RescueReset;
  next_move: string;
  defer_until: string;
  note: string;
  saved_at: string;
}

export interface QuickRestart {
  window: RestartWindow;
  energy: SignalLevel;
  sleep: RestartSleep;
  priority: string;
  changed: string;
  reminder_stance: RestartReminderStance;
  saved_at: string;
}

export interface PatternDecision {
  pattern_id: string;
  status: PatternDecisionStatus;
  updated_at: string;
}

export interface ExperimentObservation {
  id: string;
  signal: ExperimentObservationSignal;
  note: string;
  captured_at: string;
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
  observations: ExperimentObservation[];
}

export interface LocalDemoState {
  schema_version: "lifemax.local_demo.v1";
  check_in: LocalCheckIn | null;
  captures: CaptureEvent[];
  daily_plan: LocalDailyPlan | null;
  midday_rescue: MiddayRescue | null;
  quick_restart: QuickRestart | null;
  evening_close: EveningClose | null;
  memory_candidates: MemoryCandidate[];
  pattern_decisions: PatternDecision[];
  experiment: LocalExperiment | null;
  reviewed_at: string | null;
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
    rescue: "saved" | "open";
    restart: "saved" | "open";
    close: "saved" | "open";
    captures: number;
    memories: number;
    memory_candidates: number;
    kept_memories: number;
    rejected_memories: number;
    pattern_decisions: number;
    experiment: ExperimentStatus | "none";
    experiment_observations: number;
    review: "saved" | "open";
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
  rescue_summary: {
    status: "locked" | "open" | "saved";
    title: string;
    detail: string;
    reset_label: string;
    next_move: string;
  };
  restart_summary: {
    status: "open" | "saved";
    title: string;
    detail: string;
    priority: string;
  };
  memory_summary: {
    count: number;
    candidate_count: number;
    kept_count: number;
    rejected_count: number;
    total_count: number;
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
  day_review: DayReview;
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

export interface DayReview {
  status: "locked" | "ready" | "saved";
  title: string;
  confidence: Confidence;
  evidence_count: number;
  follow_through: string;
  summary: string;
  tomorrow_cue: string;
  next_action: string;
  missing_inputs: string[];
  risk_flags: string[];
  reviewed_at: string | null;
}

export function createInitialLocalDemoState(): LocalDemoState {
  return {
    schema_version: "lifemax.local_demo.v1",
    check_in: null,
    captures: [],
    daily_plan: null,
    midday_rescue: null,
    quick_restart: null,
    evening_close: null,
    memory_candidates: [],
    pattern_decisions: [],
    experiment: null,
    reviewed_at: null,
    plan_done: false,
    lowered_today: false,
    experiment_started_at: null,
    updated_at: null
  };
}

export function createLocalDemoExport(state: LocalDemoState, generatedAt: string): LocalDemoExport {
  const memorySummary = summarizeMemoryCandidates(state.memory_candidates);

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
      rescue: state.midday_rescue ? "saved" : "open",
      restart: state.quick_restart ? "saved" : "open",
      close: state.evening_close ? "saved" : "open",
      captures: state.captures.length,
      memories: memorySummary.count,
      memory_candidates: memorySummary.total_count,
      kept_memories: memorySummary.kept_count,
      rejected_memories: memorySummary.rejected_count,
      pattern_decisions: state.pattern_decisions.length,
      experiment: state.experiment?.status ?? "none",
      experiment_observations: state.experiment?.observations.length ?? 0,
      review: state.reviewed_at ? "saved" : "open"
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
      midday_rescue: normalizeMiddayRescue(parsed.midday_rescue),
      quick_restart: normalizeQuickRestart(parsed.quick_restart),
      evening_close: normalizeEveningClose(parsed.evening_close),
      memory_candidates: normalizeMemoryCandidates(parsed.memory_candidates),
      pattern_decisions: Array.isArray(parsed.pattern_decisions) ? parsed.pattern_decisions.slice(0, 20) : [],
      experiment: normalizeExperiment(parsed.experiment, parsed.experiment_started_at ?? null),
      reviewed_at: parsed.reviewed_at ?? null,
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
  const memorySummary = summarizeMemoryCandidates(state.memory_candidates);
  const rescueSummary = summarizeMiddayRescue(state.midday_rescue, planSummary, hasCheckIn);
  const restartSummary = summarizeQuickRestart(state.quick_restart);
  const dayReview = buildDayReview(state, planSummary);

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
      rescue_summary: rescueSummary,
      restart_summary: restartSummary,
      memory_summary: {
        count: memorySummary.count,
        candidate_count: memorySummary.candidate_count,
        kept_count: memorySummary.kept_count,
        rejected_count: memorySummary.rejected_count,
        total_count: memorySummary.total_count,
        latest: memorySummary.latest
      },
      freshness_summary: freshnessSummary("missing", captureCount, state.updated_at),
      pattern_cards: patternCards,
      pattern_summary: {
        title: "No pattern candidates yet",
        detail: "Save a check-in and at least one capture before LifeMax shows a local pattern.",
        ready: false
      },
      experiment_summary: summarizeExperiment(state.experiment, false),
      day_review: dayReview
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
    rescue_summary: rescueSummary,
    restart_summary: restartSummary,
    memory_summary: {
      count: memorySummary.count,
      candidate_count: memorySummary.candidate_count,
      kept_count: memorySummary.kept_count,
      rejected_count: memorySummary.rejected_count,
      total_count: memorySummary.total_count,
      latest: memorySummary.latest
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
    experiment_summary: summarizeExperiment(state.experiment, captureCount > 0),
    day_review: dayReview
  };
}

function summarizeMemoryCandidates(candidates: MemoryCandidate[]): DerivedTodayView["memory_summary"] {
  const active = candidates.filter((candidate) => candidate.status !== "rejected");
  const candidateCount = candidates.filter((candidate) => candidate.status === "candidate").length;
  const keptCount = candidates.filter((candidate) => candidate.status === "kept").length;
  const rejectedCount = candidates.filter((candidate) => candidate.status === "rejected").length;

  return {
    count: active.length,
    candidate_count: candidateCount,
    kept_count: keptCount,
    rejected_count: rejectedCount,
    total_count: candidates.length,
    latest: active[0] ?? null
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

function normalizeMiddayRescue(value: unknown): MiddayRescue | null {
  if (!value || typeof value !== "object") return null;
  const rescue = value as Partial<MiddayRescue>;
  if (!rescue.saved_at || !rescue.next_move) return null;

  return {
    trigger: normalizeRescueTrigger(rescue.trigger),
    reset: normalizeRescueReset(rescue.reset),
    next_move: rescue.next_move,
    defer_until: rescue.defer_until ?? "",
    note: rescue.note ?? "",
    saved_at: rescue.saved_at
  };
}

function normalizeQuickRestart(value: unknown): QuickRestart | null {
  if (!value || typeof value !== "object") return null;
  const restart = value as Partial<QuickRestart>;
  if (!restart.saved_at || !restart.priority) return null;

  return {
    window: normalizeRestartWindow(restart.window),
    energy: normalizeSignalLevel(restart.energy),
    sleep: normalizeRestartSleep(restart.sleep),
    priority: restart.priority,
    changed: restart.changed ?? "",
    reminder_stance: normalizeRestartReminderStance(restart.reminder_stance),
    saved_at: restart.saved_at
  };
}

function normalizeMemoryCandidates(value: unknown): MemoryCandidate[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 25)
    .map((item) => item as Partial<MemoryCandidate>)
    .filter((item) => item.id && (item.title || item.detail) && item.created_at)
    .map((item) => {
      const createdAt = item.created_at as string;

      return {
        id: item.id as string,
        title: item.title?.trim() || "Local memory candidate",
        detail: item.detail?.trim() || "No detail saved.",
        source: normalizeMemorySource(item.source),
        status: normalizeMemoryStatus(item.status),
        created_at: createdAt,
        updated_at: item.updated_at ?? createdAt,
        rejection_reason: item.rejection_reason ?? null
      };
    });
}

function normalizeMemorySource(value: unknown): MemoryCandidate["source"] {
  return value === "evening_close" || value === "pattern" || value === "experiment" || value === "rescue" || value === "restart" ? value : "pattern";
}

function normalizeMemoryStatus(value: unknown): MemoryStatus {
  return value === "candidate" || value === "kept" || value === "rejected" ? value : "candidate";
}

function normalizeSignalLevel(value: unknown): SignalLevel {
  return value === "low" || value === "ok" || value === "strong" ? value : "ok";
}

function normalizeRestartWindow(value: unknown): RestartWindow {
  return value === "one_day" || value === "three_days" || value === "seven_days" ? value : "one_day";
}

function normalizeRestartSleep(value: unknown): RestartSleep {
  return value === "rough" || value === "ok" || value === "good" ? value : "ok";
}

function normalizeRestartReminderStance(value: unknown): RestartReminderStance {
  return value === "none_today" || value === "evening_only" || value === "tomorrow" ? value : "none_today";
}

function normalizeRescueTrigger(value: unknown): RescueTrigger {
  return value === "drift" || value === "overloaded" || value === "body_noise" || value === "plan_broke" ? value : "drift";
}

function normalizeRescueReset(value: unknown): RescueReset {
  return value === "breathe" || value === "walk" || value === "water" || value === "reduce_input" ? value : "breathe";
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
        result_note: experiment.result_note ?? null,
        observations: normalizeExperimentObservations(experiment.observations)
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
    result_note: null,
    observations: []
  };
}

function normalizeExperimentObservations(value: unknown): ExperimentObservation[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 20)
    .map((item) => item as Partial<ExperimentObservation>)
    .filter((item) => item.id && item.note && item.captured_at)
    .map((item) => ({
      id: item.id as string,
      signal: normalizeExperimentSignal(item.signal),
      note: item.note as string,
      captured_at: item.captured_at as string
    }));
}

function normalizeExperimentSignal(value: unknown): ExperimentObservationSignal {
  return value === "better" || value === "same" || value === "worse" || value === "unclear" ? value : "unclear";
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

function buildDayReview(state: LocalDemoState, planSummary: DerivedTodayView["plan_summary"]): DayReview {
  const missingInputs = [
    state.check_in ? null : "check-in",
    state.daily_plan ? null : "saved plan",
    state.captures.length ? null : "capture",
    state.evening_close ? null : "evening close"
  ].filter((item): item is string => Boolean(item));
  const evidenceCount =
    (state.check_in ? 1 : 0) +
    (state.daily_plan ? 1 : 0) +
    (state.midday_rescue ? 1 : 0) +
    (state.quick_restart ? 1 : 0) +
    state.captures.length +
    (state.evening_close ? 1 : 0) +
    (state.experiment ? 1 : 0) +
    (state.experiment?.observations.length ?? 0);
  const ready = missingInputs.length === 0;
  const latestCapture = state.captures[0] ?? null;
  const tomorrowCue =
    state.evening_close?.tomorrow_hint ||
    planSummary.next_item ||
    latestCapture?.label ||
    "Capture before changing tomorrow's plan.";
  const followThrough = state.daily_plan
    ? `${planSummary.progress_label}; ${planSummary.active_count} open item${planSummary.active_count === 1 ? "" : "s"}`
    : "No saved plan yet";
  const riskFlags = [
    "manual-only confidence",
    "health integrations disabled",
    state.check_in?.stress === "high" ? "high stress check-in" : null,
    state.check_in?.body === "rough" ? "rough body signal" : null,
    state.midday_rescue ? "midday rescue used" : null,
    state.quick_restart ? "quick restart used" : null,
    state.evening_close?.recovery_impact === "draining" ? "draining close" : null
  ].filter((item): item is string => Boolean(item));

  if (!ready) {
    return {
      status: "locked",
      title: "Review unlocks after the full local loop.",
      confidence: "low",
      evidence_count: evidenceCount,
      follow_through: followThrough,
      summary: `Needs ${missingInputs.join(", ")} before LifeMax can save a local day review.`,
      tomorrow_cue: tomorrowCue,
      next_action: `Add ${missingInputs[0]} without raising intensity.`,
      missing_inputs: missingInputs,
      risk_flags: riskFlags,
      reviewed_at: state.reviewed_at
    };
  }

  const status: DayReview["status"] = state.reviewed_at ? "saved" : "ready";
  const confidence: Confidence = state.captures.length >= 2 && state.evening_close ? "medium" : "low";
  const completionLanguage =
    planSummary.completed_count > 0
      ? `${planSummary.completed_count} plan item${planSummary.completed_count === 1 ? "" : "s"} moved.`
      : "No plan item is marked done yet.";

  return {
    status,
    title: status === "saved" ? "Review checkpoint saved." : "Local day review ready.",
    confidence,
    evidence_count: evidenceCount,
    follow_through: followThrough,
    summary: `${completionLanguage} ${state.captures.length} capture${state.captures.length === 1 ? "" : "s"} and the evening close are enough for a cautious local review, not a causal claim.`,
    tomorrow_cue: tomorrowCue,
    next_action:
      state.experiment?.status === "active"
        ? "Keep the experiment window intact and capture what changes."
        : "Save the review checkpoint, then decide whether one pattern deserves a small experiment.",
    missing_inputs: [],
    risk_flags: riskFlags,
    reviewed_at: state.reviewed_at
  };
}

function summarizeMiddayRescue(
  rescue: MiddayRescue | null,
  planSummary: DerivedTodayView["plan_summary"],
  hasCheckIn: boolean
): DerivedTodayView["rescue_summary"] {
  if (!hasCheckIn) {
    return {
      status: "locked",
      title: "Rescue unlocks after check-in.",
      detail: "LifeMax needs a manual state before suggesting a lower-intensity reset.",
      reset_label: "None",
      next_move: "Save check-in first"
    };
  }

  if (!rescue) {
    const nextMove = planSummary.next_item ?? "Pick the smallest useful next move";
    return {
      status: "open",
      title: "Midday rescue is ready if the plan drifts.",
      detail: "Use one reset and one lower-intensity move. No shame loop.",
      reset_label: "Choose reset",
      next_move: nextMove
    };
  }

  return {
    status: "saved",
    title: "Midday rescue saved.",
    detail: `${labelForRescueReset(rescue.reset)} reset. Next: ${rescue.next_move}${rescue.defer_until ? ` after ${rescue.defer_until}` : ""}.`,
    reset_label: labelForRescueReset(rescue.reset),
    next_move: rescue.next_move
  };
}

function summarizeQuickRestart(restart: QuickRestart | null): DerivedTodayView["restart_summary"] {
  if (!restart) {
    return {
      status: "open",
      title: "Quick restart is ready.",
      detail: "Use minimum fields after a missed day: energy, sleep, one priority, and a reminder boundary.",
      priority: "No restart saved"
    };
  }

  return {
    status: "saved",
    title: "Quick restart saved.",
    detail: `${labelForRestartWindow(restart.window)} reset. Sleep ${restart.sleep}. Reminders: ${labelForRestartReminder(restart.reminder_stance)}.`,
    priority: restart.priority
  };
}

function labelForRestartWindow(window: RestartWindow) {
  switch (window) {
    case "three_days":
      return "3-day";
    case "seven_days":
      return "7-day";
    case "one_day":
    default:
      return "1-day";
  }
}

function labelForRestartReminder(stance: RestartReminderStance) {
  switch (stance) {
    case "evening_only":
      return "evening only";
    case "tomorrow":
      return "tomorrow";
    case "none_today":
    default:
      return "none today";
  }
}

function labelForRescueReset(reset: RescueReset) {
  switch (reset) {
    case "walk":
      return "Short walk";
    case "water":
      return "Water break";
    case "reduce_input":
      return "Reduce input";
    case "breathe":
    default:
      return "Breathe";
  }
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
        ? `${experiment.minimum_window_days}-day minimum. Target: ${experiment.target_signal}. ${formatObservationCount(experiment.observations.length)} logged.`
        : `${experiment.result_note ?? "No result note saved."} ${formatObservationCount(experiment.observations.length)} logged.`
  };
}

function formatObservationCount(count: number) {
  return `${count} observation${count === 1 ? "" : "s"}`;
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
