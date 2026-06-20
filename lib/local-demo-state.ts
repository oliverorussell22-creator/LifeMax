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
export type ExperimentDecision = "keep" | "adjust" | "drop" | "inconclusive";
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
  updated_at: string;
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
  decision: ExperimentDecision | null;
  result_note: string | null;
  observations: ExperimentObservation[];
}

export interface LocalDayArchive {
  id: string;
  archived_at: string;
  day_label: string;
  review_title: string;
  review_summary: string;
  tomorrow_cue: string;
  follow_through: string;
  evidence_count: number;
  confidence: Confidence;
  plan_progress: string;
  capture_count: number;
  kept_memory_count: number;
  rejected_memory_count: number;
  experiment_status: ExperimentStatus | "none";
  experiment_observation_count: number;
  rescue_used: boolean;
  restart_used: boolean;
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
  day_archives: LocalDayArchive[];
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
    experiment_decision: ExperimentDecision | "none";
    experiment_observations: number;
    day_archives: number;
    history_insight: "empty" | "checkpoint" | "emerging" | "trend";
    review: "saved" | "open";
  };
  state: LocalDemoState;
}

export type LocalDemoImportResult =
  | {
      ok: true;
      accepted_schema: "export" | "state";
      state: LocalDemoState;
      summary: LocalDemoExport["summary"];
    }
  | {
      ok: false;
      error: string;
    };

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
    decision: ExperimentDecision | null;
    observation_count: number;
    better_count: number;
    same_count: number;
    worse_count: number;
    unclear_count: number;
    next_action: string;
  };
  day_review: DayReview;
  day_history_summary: {
    count: number;
    latest: LocalDayArchive | null;
    title: string;
    detail: string;
  };
  history_insight: {
    status: "empty" | "checkpoint" | "emerging" | "trend";
    title: string;
    detail: string;
    signal_label: string;
    next_action: string;
    truth_boundary: string;
    metrics: Array<{ label: string; value: string }>;
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
    day_archives: [],
    reviewed_at: null,
    plan_done: false,
    lowered_today: false,
    experiment_started_at: null,
    updated_at: null
  };
}

export function createLocalDemoExport(state: LocalDemoState, generatedAt: string): LocalDemoExport {
  const memorySummary = summarizeMemoryCandidates(state.memory_candidates);
  const historyInsight = summarizeHistoryInsight(state.day_archives);

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
      experiment_decision: state.experiment?.decision ?? "none",
      experiment_observations: state.experiment?.observations.length ?? 0,
      day_archives: state.day_archives.length,
      history_insight: historyInsight.status,
      review: state.reviewed_at ? "saved" : "open"
	    },
	    state
	  };
}

export function serializeLocalDemoExport(state: LocalDemoState, generatedAt: string): string {
  return JSON.stringify(createLocalDemoExport(state, generatedAt), null, 2);
}

export function parseLocalDemoImport(raw: string): LocalDemoImportResult {
  if (!raw.trim()) {
    return { ok: false, error: "Paste a LifeMax local export JSON before importing." };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return { ok: false, error: "Import must be a JSON object from a LifeMax local export." };
    }

    const schema = parsed.schema_version;
    const acceptedSchema = schema === "lifemax.local_demo_export.v1" ? "export" : schema === "lifemax.local_demo.v1" ? "state" : null;
    const stateCandidate = acceptedSchema === "export" ? parsed.state : parsed;

    if (!acceptedSchema || !isRecord(stateCandidate) || stateCandidate.schema_version !== "lifemax.local_demo.v1") {
      return { ok: false, error: "This is not a LifeMax browser-local demo export." };
    }

    const state = readStoredLocalDemoState(JSON.stringify(stateCandidate));

    return {
      ok: true,
      accepted_schema: acceptedSchema,
      state,
      summary: createLocalDemoExport(state, new Date().toISOString()).summary
    };
  } catch {
    return { ok: false, error: "Import JSON could not be parsed. Check that the pasted export is complete." };
  }
}

export function readStoredLocalDemoState(raw: string | null): LocalDemoState {
  if (!raw) return createInitialLocalDemoState();

  try {
    const parsed = JSON.parse(raw) as Partial<LocalDemoState>;
    if (parsed.schema_version !== "lifemax.local_demo.v1") return createInitialLocalDemoState();

    return {
      schema_version: "lifemax.local_demo.v1",
      check_in: parsed.check_in ?? null,
      captures: normalizeCaptures(parsed.captures),
      daily_plan: normalizeDailyPlan(parsed.daily_plan),
      midday_rescue: normalizeMiddayRescue(parsed.midday_rescue),
      quick_restart: normalizeQuickRestart(parsed.quick_restart),
      evening_close: normalizeEveningClose(parsed.evening_close),
      memory_candidates: normalizeMemoryCandidates(parsed.memory_candidates),
      pattern_decisions: Array.isArray(parsed.pattern_decisions) ? parsed.pattern_decisions.slice(0, 20) : [],
      experiment: normalizeExperiment(parsed.experiment, parsed.experiment_started_at ?? null),
      day_archives: normalizeDayArchives(parsed.day_archives),
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
  const dayHistorySummary = summarizeDayHistory(state.day_archives);
  const historyInsight = summarizeHistoryInsight(state.day_archives);

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
      day_review: dayReview,
      day_history_summary: dayHistorySummary,
      history_insight: historyInsight
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
    day_review: dayReview,
    day_history_summary: dayHistorySummary,
    history_insight: historyInsight
  };
}

export function createDayArchive(state: LocalDemoState, review: DayReview, archivedAt: string): LocalDayArchive {
  const planSummary = summarizePlan(state.daily_plan);
  const memorySummary = summarizeMemoryCandidates(state.memory_candidates);

  return {
    id: `day-archive-${Date.parse(archivedAt) || Date.now()}`,
    archived_at: archivedAt,
    day_label: formatArchiveDayLabel(archivedAt),
    review_title: review.title,
    review_summary: review.summary,
    tomorrow_cue: review.tomorrow_cue,
    follow_through: review.follow_through,
    evidence_count: review.evidence_count,
    confidence: review.confidence,
    plan_progress: planSummary.progress_label,
    capture_count: state.captures.length,
    kept_memory_count: memorySummary.kept_count,
    rejected_memory_count: memorySummary.rejected_count,
    experiment_status: state.experiment?.status ?? "none",
    experiment_observation_count: state.experiment?.observations.length ?? 0,
    rescue_used: Boolean(state.midday_rescue),
    restart_used: Boolean(state.quick_restart)
  };
}

export function createPlanFromHistoryArchive(
  archive: LocalDayArchive,
  currentPlan: LocalDailyPlan | null,
  timestamp: string
): LocalDailyPlan {
  const cue = archive.tomorrow_cue.trim() || "Use the most useful local history cue";
  const fallbackOptional = currentPlan?.must_do && currentPlan.must_do !== cue ? currentPlan.must_do : "Capture whether the cue helped today";

  return {
    must_do: cue,
    optional_1: fallbackOptional,
    optional_2: "Close the loop and archive the result",
    avoid_today: "Do not treat one archived day as a trend",
    shutdown_target: currentPlan?.shutdown_target || "8:30 PM",
    item_statuses: {
      must_do: "open",
      optional_1: "open",
      optional_2: "open"
    },
    accepted_at: timestamp,
    updated_at: timestamp
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

function normalizeCaptures(value: unknown): CaptureEvent[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 50)
    .map((item) => item as Partial<CaptureEvent>)
    .filter((item) => item.id && (item.label || item.note) && item.created_at)
    .map((item) => {
      const createdAt = item.created_at as string;

      return {
        id: item.id as string,
        kind: normalizeCaptureKind(item.kind),
        label: item.label?.trim() || labelForCaptureKind(normalizeCaptureKind(item.kind)),
        note: item.note?.trim() ?? "",
        impact: normalizeCaptureImpact(item.impact),
        created_at: createdAt,
        updated_at: item.updated_at ?? createdAt
      };
    });
}

function normalizeCaptureKind(value: unknown): CaptureKind {
  return value === "supplement" || value === "habit" || value === "symptom" || value === "hydration" || value === "note" ? value : "note";
}

function normalizeCaptureImpact(value: unknown): CaptureImpact {
  return value === "helped" || value === "neutral" || value === "drained" || value === "uncertain" ? value : "uncertain";
}

function labelForCaptureKind(kind: CaptureKind) {
  switch (kind) {
    case "supplement":
      return "Supplement";
    case "habit":
      return "Habit";
    case "symptom":
      return "Symptom";
    case "hydration":
      return "Hydration";
    case "note":
    default:
      return "Note";
  }
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

function normalizeDayArchives(value: unknown): LocalDayArchive[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 20)
    .map((item) => item as Partial<LocalDayArchive>)
    .filter((item) => item.id && item.archived_at && item.review_summary)
    .map((item) => ({
      id: item.id as string,
      archived_at: item.archived_at as string,
      day_label: item.day_label?.trim() || formatArchiveDayLabel(item.archived_at as string),
      review_title: item.review_title?.trim() || "Local day archived",
      review_summary: item.review_summary?.trim() || "No review summary saved.",
      tomorrow_cue: item.tomorrow_cue?.trim() || "No tomorrow cue saved.",
      follow_through: item.follow_through?.trim() || "No follow-through summary saved.",
      evidence_count: normalizeNonNegativeNumber(item.evidence_count),
      confidence: normalizeConfidence(item.confidence),
      plan_progress: item.plan_progress?.trim() || "No plan progress",
      capture_count: normalizeNonNegativeNumber(item.capture_count),
      kept_memory_count: normalizeNonNegativeNumber(item.kept_memory_count),
      rejected_memory_count: normalizeNonNegativeNumber(item.rejected_memory_count),
      experiment_status: normalizeExperimentStatus(item.experiment_status),
      experiment_observation_count: normalizeNonNegativeNumber(item.experiment_observation_count),
      rescue_used: Boolean(item.rescue_used),
      restart_used: Boolean(item.restart_used)
    }));
}

function normalizeNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function normalizeConfidence(value: unknown): Confidence {
  return value === "medium" || value === "high" ? value : "low";
}

function normalizeExperimentStatus(value: unknown): ExperimentStatus | "none" {
  return value === "active" || value === "stopped" || value === "inconclusive" || value === "none" ? value : "none";
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
        decision: normalizeExperimentDecision(experiment.decision),
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
    decision: null,
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

function normalizeExperimentDecision(value: unknown): ExperimentDecision | null {
  return value === "keep" || value === "adjust" || value === "drop" || value === "inconclusive" ? value : null;
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
          detail: "Use a weak pattern to create a reversible three-day experiment.",
          decision: null,
          observation_count: 0,
          better_count: 0,
          same_count: 0,
          worse_count: 0,
          unclear_count: 0,
          next_action: "Start one local experiment only if it keeps the day smaller."
        }
      : {
          status: "locked",
          title: "No experiment yet.",
          detail: "Save a check-in and capture before starting a local experiment.",
          decision: null,
          observation_count: 0,
          better_count: 0,
          same_count: 0,
          worse_count: 0,
          unclear_count: 0,
          next_action: "Add one capture before running an experiment."
        };
  }

  const signalCounts = countExperimentSignals(experiment.observations);
  const observationDetail = formatObservationCount(experiment.observations.length);
  const decisionPrefix = experiment.decision ? `Decision: ${formatExperimentDecision(experiment.decision)}. ` : "";

  return {
    status: experiment.status,
    title:
      experiment.status === "active"
        ? experiment.hypothesis
        : experiment.status === "inconclusive"
          ? "Experiment ended inconclusive."
          : experiment.decision
            ? "Experiment decision saved."
            : "Experiment stopped.",
    detail:
      experiment.status === "active"
        ? `${experiment.minimum_window_days}-day minimum. Target: ${experiment.target_signal}. ${observationDetail} logged.`
        : `${decisionPrefix}${experiment.result_note ?? "No result note saved."} ${observationDetail} logged.`,
    decision: experiment.decision,
    observation_count: experiment.observations.length,
    better_count: signalCounts.better,
    same_count: signalCounts.same,
    worse_count: signalCounts.worse,
    unclear_count: signalCounts.unclear,
    next_action: experiment.status === "active" ? nextExperimentAction(signalCounts) : nextEndedExperimentAction(experiment)
  };
}

function countExperimentSignals(observations: ExperimentObservation[]) {
  return observations.reduce(
    (counts, observation) => ({
      ...counts,
      [observation.signal]: counts[observation.signal] + 1
    }),
    { better: 0, same: 0, worse: 0, unclear: 0 } satisfies Record<ExperimentObservationSignal, number>
  );
}

function nextExperimentAction(counts: Record<ExperimentObservationSignal, number>): string {
  const total = counts.better + counts.same + counts.worse + counts.unclear;
  if (total === 0) return "Log one observation before deciding anything.";
  if (total < 3) return "Keep the test reversible until there are at least three local observations.";
  if (counts.worse > 0) return "Adjust or drop the test if it adds pressure or worsens the day.";
  if (counts.better >= 2) return "Consider keeping the smallest useful part, still as a local note.";
  return "Mark the result as inconclusive or adjust the test before repeating it.";
}

function nextEndedExperimentAction(experiment: LocalExperiment): string {
  switch (experiment.decision) {
    case "keep":
      return "Use the kept decision as a local memory cue, not as medical advice.";
    case "adjust":
      return "Change one variable before starting another local experiment.";
    case "drop":
      return "Leave the intervention out unless new evidence appears.";
    case "inconclusive":
      return "Keep watching without changing routines.";
    default:
      return "Add a decision note before starting another experiment.";
  }
}

function formatExperimentDecision(decision: ExperimentDecision): string {
  switch (decision) {
    case "keep":
      return "keep";
    case "adjust":
      return "adjust";
    case "drop":
      return "drop";
    case "inconclusive":
      return "inconclusive";
  }
}

function summarizeHistoryInsight(archives: LocalDayArchive[]): DerivedTodayView["history_insight"] {
  const recent = archives.slice(0, 5);
  const latest = recent[0] ?? null;
  const totalEvidence = recent.reduce((sum, archive) => sum + archive.evidence_count, 0);
  const totalCaptures = recent.reduce((sum, archive) => sum + archive.capture_count, 0);
  const totalObservations = recent.reduce((sum, archive) => sum + archive.experiment_observation_count, 0);
  const rescueCount = recent.filter((archive) => archive.rescue_used).length;
  const restartCount = recent.filter((archive) => archive.restart_used).length;

  if (!latest) {
    return {
      status: "empty",
      title: "No local insight yet",
      detail: "Archive a completed local day before LifeMax summarizes history.",
      signal_label: "empty",
      next_action: "Complete the local loop, save the review, then save it to history.",
      truth_boundary: "History insights are derived only from browser-local archives.",
      metrics: [
        { label: "Checkpoints", value: "0" },
        { label: "Evidence", value: "0" },
        { label: "Captures", value: "0" },
        { label: "Observations", value: "0" }
      ]
    };
  }

  if (recent.length === 1) {
    return {
      status: "checkpoint",
      title: "One checkpoint, not a trend yet",
      detail: `${latest.day_label}: ${latest.plan_progress}; next cue is ${latest.tomorrow_cue}.`,
      signal_label: "1 checkpoint",
      next_action: "Archive one more closed day before changing the experiment or treating this as a pattern.",
      truth_boundary: "One browser-local checkpoint can guide tomorrow, but it is not a trend.",
      metrics: [
        { label: "Checkpoints", value: "1" },
        { label: "Evidence", value: String(totalEvidence) },
        { label: "Captures", value: String(totalCaptures) },
        { label: "Recovery aids", value: String(rescueCount + restartCount) }
      ]
    };
  }

  const averageEvidence = (totalEvidence / recent.length).toFixed(1);
  const planCompletedTotal = recent.reduce((sum, archive) => sum + parseCompletedPlanItems(archive.plan_progress), 0);
  const repeatedCue = mostFrequent(recent.map((archive) => archive.tomorrow_cue));
  const repeatedCueCount = recent.filter((archive) => archive.tomorrow_cue === repeatedCue).length;
  const hasEnoughForTrend = recent.length >= 3 && repeatedCueCount >= 2 && totalEvidence >= recent.length * 3 && totalCaptures >= recent.length;
  const signalLabel = hasEnoughForTrend ? "local trend" : totalEvidence >= recent.length * 2 ? "emerging signal" : "thin signal";
  const nextAction =
    planCompletedTotal === 0
      ? "Keep tomorrow's cue smaller before adding more experiments."
      : `Repeat "${repeatedCue}" once more before changing the experiment.`;

  return {
    status: hasEnoughForTrend ? "trend" : "emerging",
    title: hasEnoughForTrend ? `${recent.length} checkpoints form a local trend` : `${recent.length} checkpoints, still early`,
    detail: `${averageEvidence} evidence points per checkpoint; ${planCompletedTotal} plan items completed; ${rescueCount} rescue and ${restartCount} restart records.`,
    signal_label: signalLabel,
    next_action: nextAction,
    truth_boundary: hasEnoughForTrend
      ? "This is a browser-local trend summary, not a causal or medical claim."
      : "This is an early browser-local signal, not a causal trend.",
    metrics: [
      { label: "Checkpoints", value: String(recent.length) },
      { label: "Evidence/day", value: averageEvidence },
      { label: "Captures", value: String(totalCaptures) },
      { label: "Observations", value: String(totalObservations) }
    ]
  };
}

function summarizeDayHistory(archives: LocalDayArchive[]): DerivedTodayView["day_history_summary"] {
  const latest = archives[0] ?? null;
  if (!latest) {
    return {
      count: 0,
      latest: null,
      title: "No archived days yet",
      detail: "Save a local day review to create a browser-only history checkpoint."
    };
  }

  return {
    count: archives.length,
    latest,
    title: `${archives.length} local day${archives.length === 1 ? "" : "s"} archived`,
    detail: `${latest.day_label}: ${latest.plan_progress}; ${latest.evidence_count} evidence point${latest.evidence_count === 1 ? "" : "s"}. Next cue: ${latest.tomorrow_cue}`
  };
}

function parseCompletedPlanItems(progressLabel: string): number {
  const match = progressLabel.match(/^(\d+)\/\d+ done$/);
  return match ? Number(match[1]) : 0;
}

function mostFrequent(values: string[]): string {
  const counts = new Map<string, number>();
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }

  let best = values.find((value) => value.trim())?.trim() ?? "the latest cue";
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }

  return best;
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

function formatArchiveDayLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Local day";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
