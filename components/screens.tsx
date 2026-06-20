"use client";

import { useMemo, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { AppShell } from "@/components/AppShell";
import { ScreenHeader, StatusGrid } from "@/components/ui";
import {
  deriveTodayView,
  formatShortTime,
  localDemoStorageKey,
  readStoredLocalDemoState,
  serializeLocalDemoExport,
  type BodyLevel,
  type CaptureImpact,
  type CaptureKind,
  type EveningClose,
  type LocalDemoState,
  type LocalDailyPlan,
  type PatternCard,
  type PatternDecisionStatus,
  type PlanItemStatus,
  type PlanSlot,
  type RecoveryImpact,
  type SignalLevel,
  type StressLevel
} from "@/lib/local-demo-state";

type StorageStatus = "loading" | "ready" | "error";

const energyOptions: Array<{ value: SignalLevel; label: string }> = [
  { value: "low", label: "Low" },
  { value: "ok", label: "OK" },
  { value: "strong", label: "Strong" }
];

const moodOptions: Array<{ value: SignalLevel; label: string }> = [
  { value: "low", label: "Low" },
  { value: "ok", label: "OK" },
  { value: "strong", label: "Good" }
];

const stressOptions: Array<{ value: StressLevel; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

const bodyOptions: Array<{ value: BodyLevel; label: string }> = [
  { value: "rough", label: "Rough" },
  { value: "ok", label: "OK" },
  { value: "good", label: "Good" }
];

const frictionOptions = ["low sleep", "too much input", "body noise", "schedule friction", "good momentum"];

const captureKinds: Array<{ value: CaptureKind; label: string; example: string }> = [
  { value: "supplement", label: "Supplement", example: "Magnesium, creatine, caffeine" },
  { value: "habit", label: "Habit", example: "Walk, sunlight, deep work" },
  { value: "symptom", label: "Symptom", example: "Headache, nausea, soreness" },
  { value: "hydration", label: "Hydration", example: "Water, electrolytes, skipped" },
  { value: "note", label: "Note", example: "Anything worth remembering" }
];

const impactOptions: Array<{ value: CaptureImpact; label: string }> = [
  { value: "helped", label: "Helped" },
  { value: "neutral", label: "Neutral" },
  { value: "drained", label: "Drained" },
  { value: "uncertain", label: "Unsure" }
];

const recoveryImpactOptions: Array<{ value: RecoveryImpact; label: string }> = [
  { value: "restored", label: "Restored" },
  { value: "neutral", label: "Neutral" },
  { value: "draining", label: "Draining" }
];

export function TodayScreen() {
  const { state, storageStatus, storageMessage, setLocalState } = useLocalDemoState();
  const today = useMemo(() => deriveTodayView(state), [state]);
  const activePlan = state.daily_plan ?? today.suggested_plan;
  const [draft, setDraft] = useState({
    energy: "ok" as SignalLevel,
    mood: "ok" as SignalLevel,
    stress: "medium" as StressLevel,
    body: "ok" as BodyLevel,
    frictionTags: [] as string[],
    note: ""
  });

  function toggleFrictionTag(tag: string) {
    setDraft((current) => ({
      ...current,
      frictionTags: current.frictionTags.includes(tag)
        ? current.frictionTags.filter((item) => item !== tag)
        : [...current.frictionTags, tag]
    }));
  }

  function saveCheckIn() {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      check_in: {
        energy: draft.energy,
        mood: draft.mood,
        stress: draft.stress,
        body: draft.body,
        friction_tags: draft.frictionTags,
        note: draft.note.trim(),
        saved_at: now
      },
      plan_done: false,
      updated_at: now
    }));
  }

  function lowerIntensity() {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      lowered_today: true,
      updated_at: now
    }));
  }

  function togglePlanDone() {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      plan_done: !current.plan_done,
      updated_at: now
    }));
  }

  function savePlan(plan: LocalDailyPlan) {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      daily_plan: {
        ...plan,
        accepted_at: plan.accepted_at || now,
        updated_at: now
      },
      plan_done: Object.values(plan.item_statuses).every((status) => status === "done"),
      updated_at: now
    }));
  }

  function updatePlanItemStatus(slot: PlanSlot, status: PlanItemStatus) {
    const now = new Date().toISOString();
    setLocalState((current) => {
      const basePlan = current.daily_plan ?? today.suggested_plan;
      const nextPlan = {
        ...basePlan,
        item_statuses: {
          ...basePlan.item_statuses,
          [slot]: status
        },
        updated_at: now
      };

      return {
        ...current,
        daily_plan: nextPlan,
        plan_done: Object.values(nextPlan.item_statuses).every((itemStatus) => itemStatus === "done"),
        updated_at: now
      };
    });
  }

  function saveEveningClose(close: EveningClose) {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      evening_close: close,
      memory_candidates: [
        {
          id: `memory-${Date.now()}`,
          title: close.tomorrow_hint || "Tomorrow cue from evening close",
          detail: close.why || close.completed || "Evening close saved without a long note.",
          source: "evening_close" as const,
          created_at: now
        },
        ...current.memory_candidates
      ].slice(0, 20),
      updated_at: now
    }));
  }

  return (
    <AppShell active="today">
      <section className="screen today-layout" data-screen="today-functional">
        <div className="screen-main">
          <ScreenHeader
            kicker="Today"
            title="Check in, then keep the day honest."
            copy="This works in local browser storage. No WHOOP, account, hosted AI, or backend write is claimed."
          />
          <RuntimeNotice status={storageStatus} message={storageMessage} />
          <StatusGrid
            items={[
              { label: "State", value: today.state.replace("_", " ") },
              { label: "Confidence", value: today.confidence },
              { label: "Intensity cap", value: String(today.intensity_cap) },
              { label: "Plan", value: today.plan_summary.progress_label }
            ]}
          />
          <WorkflowRail state={state} today={today} />

          <section className="panel command-panel" aria-label="Today command center">
            <div>
              <p className="kicker">What now</p>
              <h2 className="panel-title">{today.recommended_move.title}</h2>
              <p className="panel-copy">{today.recommended_move.reason}</p>
            </div>
            <div className="command-grid">
              <span>
                <strong>Why</strong>
                {today.primary_reason}
              </span>
              <span>
                <strong>Next item</strong>
                {today.plan_summary.next_item ?? "Accept a plan first"}
              </span>
              <span>
                <strong>Boundary</strong>
                {today.plan_summary.avoid_today}
              </span>
              <span>
                <strong>Close loop</strong>
                {today.evening_summary.status === "closed" ? today.evening_summary.detail : "open"}
              </span>
            </div>
            <div className="action-row">
              <button className="primary-action" type="button" onClick={saveCheckIn} data-testid="save-checkin">
                Save check-in
              </button>
              <button className="secondary-action" type="button" onClick={lowerIntensity} data-testid="lower-intensity">
                Lower intensity
              </button>
            </div>
          </section>

          <CheckInForm
            draft={draft}
            onDraftChange={setDraft}
            onTagToggle={toggleFrictionTag}
            onSave={saveCheckIn}
          />
          <DailyPlanPanel
            key={getPlanSyncKey(activePlan)}
            plan={activePlan}
            summary={today.plan_summary}
            onSave={savePlan}
            onStatusChange={updatePlanItemStatus}
          />
          <EveningClosePanel close={state.evening_close} onSave={saveEveningClose} />
        </div>

        <aside className="screen-aside" aria-label="Today state">
          <section className="panel" aria-label="Recovery boundary">
            <p className="kicker">Boundary</p>
            <h2 className="panel-title">{today.recovery_boundary.title}</h2>
            <p className="panel-copy">{today.recovery_boundary.detail}</p>
          </section>

          <section className="panel" aria-label="Today's plan">
            <div className="section-heading-row">
              <div>
                <p className="kicker">Plan</p>
                <h2 className="panel-title">{today.plan_summary.status === "missing" ? "Suggested plan" : "Today plan"}</h2>
              </div>
              <span className={today.plan_summary.status === "complete" ? "state-pill state-pill-good" : "state-pill"}>{today.plan_summary.status}</span>
            </div>
            <ol className="plan-list">
              <li>{(state.daily_plan ?? today.suggested_plan).must_do}</li>
              <li>{(state.daily_plan ?? today.suggested_plan).optional_1}</li>
              <li>{(state.daily_plan ?? today.suggested_plan).optional_2}</li>
            </ol>
            <button className="secondary-action full-width" type="button" onClick={togglePlanDone} data-testid="toggle-plan">
              {state.plan_done ? "Reopen plan" : "Mark one item done"}
            </button>
          </section>

          <section className="panel" aria-label="Memory candidates">
            <p className="kicker">Memory</p>
            <h2 className="panel-title">{today.memory_summary.count ? `${today.memory_summary.count} local candidate` : "No memory candidate yet"}</h2>
            <p className="panel-copy">
              {today.memory_summary.latest
                ? `${today.memory_summary.latest.title}: ${today.memory_summary.latest.detail}`
                : "Evening close can create a local candidate for tomorrow without claiming backend memory."}
            </p>
          </section>

          <FreshnessPanel items={today.freshness_summary} />
        </aside>
      </section>
    </AppShell>
  );
}

function WorkflowRail({
  state,
  today
}: Readonly<{ state: LocalDemoState; today: ReturnType<typeof deriveTodayView> }>) {
  const steps = [
    {
      label: "Check-in",
      value: state.check_in ? "saved" : "needed",
      detail: state.check_in ? formatShortTime(state.check_in.saved_at) : "Start here",
      href: "/today",
      tone: state.check_in ? "good" : "attention"
    },
    {
      label: "Plan",
      value: today.plan_summary.progress_label,
      detail: today.plan_summary.next_item ?? today.plan_summary.avoid_today,
      href: "/today",
      tone: today.plan_summary.status === "complete" ? "good" : today.plan_summary.status === "missing" ? "attention" : "active"
    },
    {
      label: "Close",
      value: today.evening_summary.status,
      detail: today.evening_summary.status === "closed" ? "memory ready" : "tonight",
      href: "/today",
      tone: today.evening_summary.status === "closed" ? "good" : "active"
    },
    {
      label: "Learn",
      value: today.experiment_summary.status,
      detail: today.pattern_summary.ready ? "patterns ready" : "needs capture",
      href: today.pattern_summary.ready ? "/patterns" : "/capture",
      tone: today.experiment_summary.status === "active" ? "good" : today.pattern_summary.ready ? "active" : "muted"
    }
  ];

  return (
    <section className="workflow-rail" aria-label="Daily workflow map">
      {steps.map((step) => (
        <a className={`workflow-step workflow-step-${step.tone}`} href={step.href} key={step.label}>
          <span className="workflow-step-label">{step.label}</span>
          <strong>{step.value}</strong>
          <span>{step.detail}</span>
        </a>
      ))}
    </section>
  );
}

function CheckInForm({
  draft,
  onDraftChange,
  onTagToggle,
  onSave
}: Readonly<{
  draft: {
    energy: SignalLevel;
    mood: SignalLevel;
    stress: StressLevel;
    body: BodyLevel;
    frictionTags: string[];
    note: string;
  };
  onDraftChange: Dispatch<
    SetStateAction<{
      energy: SignalLevel;
      mood: SignalLevel;
      stress: StressLevel;
      body: BodyLevel;
      frictionTags: string[];
      note: string;
    }>
  >;
  onTagToggle: (tag: string) => void;
  onSave: () => void;
}>) {
  return (
    <section className="panel form-panel" aria-label="Manual check-in">
      <div className="section-heading-row">
        <div>
          <p className="kicker">Manual check-in</p>
          <h2 className="panel-title">Four signals and an optional note</h2>
        </div>
        <span className="state-pill">local draft</span>
      </div>
      <SegmentedControl
        label="Energy"
        value={draft.energy}
        options={energyOptions}
        onChange={(energy) => onDraftChange((current) => ({ ...current, energy }))}
      />
      <SegmentedControl
        label="Mood"
        value={draft.mood}
        options={moodOptions}
        onChange={(mood) => onDraftChange((current) => ({ ...current, mood }))}
      />
      <SegmentedControl
        label="Stress"
        value={draft.stress}
        options={stressOptions}
        onChange={(stress) => onDraftChange((current) => ({ ...current, stress }))}
      />
      <SegmentedControl
        label="Body"
        value={draft.body}
        options={bodyOptions}
        onChange={(body) => onDraftChange((current) => ({ ...current, body }))}
      />

      <fieldset className="chip-field">
        <legend>Friction tags</legend>
        <div className="chip-row">
          {frictionOptions.map((tag) => (
            <button
              className="chip-button"
              type="button"
              key={tag}
              aria-pressed={draft.frictionTags.includes(tag)}
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="input-label" htmlFor="checkin-note">
        Note
      </label>
      <textarea
        id="checkin-note"
        className="text-area"
        maxLength={220}
        placeholder="What should future you remember?"
        value={draft.note}
        onChange={(event) => onDraftChange((current) => ({ ...current, note: event.target.value }))}
      />
      <p className="field-help">{220 - draft.note.length} characters left. Notes stay in this browser for this demo.</p>
      <button className="primary-action full-width" type="button" onClick={onSave}>
        Save check-in
      </button>
    </section>
  );
}

function DailyPlanPanel({
  plan,
  summary,
  onSave,
  onStatusChange
}: Readonly<{
  plan: LocalDailyPlan;
  summary: ReturnType<typeof deriveTodayView>["plan_summary"];
  onSave: (plan: LocalDailyPlan) => void;
  onStatusChange: (slot: PlanSlot, status: PlanItemStatus) => void;
}>) {
  const [draft, setDraft] = useState(plan);

  function updateField(field: keyof Pick<LocalDailyPlan, "must_do" | "optional_1" | "optional_2" | "avoid_today" | "shutdown_target">, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <section className="panel form-panel" aria-label="Daily plan editor">
      <div className="section-heading-row">
        <div>
          <p className="kicker">Daily plan</p>
          <h2 className="panel-title">One must-do, two optional moves, one boundary</h2>
        </div>
        <span className={summary.status === "complete" ? "state-pill state-pill-good" : "state-pill"}>{summary.progress_label}</span>
      </div>
      <PlanInput label="Must-do" value={draft.must_do} onChange={(value) => updateField("must_do", value)} />
      <PlanInput label="Optional move 1" value={draft.optional_1} onChange={(value) => updateField("optional_1", value)} />
      <PlanInput label="Optional move 2" value={draft.optional_2} onChange={(value) => updateField("optional_2", value)} />
      <PlanInput label="Avoid today" value={draft.avoid_today} onChange={(value) => updateField("avoid_today", value)} />
      <PlanInput label="Shutdown target" value={draft.shutdown_target} onChange={(value) => updateField("shutdown_target", value)} />
      <div className="plan-status-grid" aria-label="Plan item status controls">
        <PlanStatusRow label="Must-do" slot="must_do" status={plan.item_statuses.must_do} onChange={onStatusChange} />
        <PlanStatusRow label="Optional 1" slot="optional_1" status={plan.item_statuses.optional_1} onChange={onStatusChange} />
        <PlanStatusRow label="Optional 2" slot="optional_2" status={plan.item_statuses.optional_2} onChange={onStatusChange} />
      </div>
      <button className="primary-action full-width" type="button" onClick={() => onSave(draft)} data-testid="save-plan">
        Save day plan
      </button>
      <p className="field-help">Plan edits stay local. Completion changes Today, Patterns, and the evening close context.</p>
    </section>
  );
}

function getPlanSyncKey(plan: LocalDailyPlan) {
  return [
    plan.accepted_at,
    plan.updated_at,
    plan.must_do,
    plan.optional_1,
    plan.optional_2,
    plan.avoid_today,
    plan.shutdown_target,
    plan.item_statuses.must_do,
    plan.item_statuses.optional_1,
    plan.item_statuses.optional_2
  ].join("|");
}

function PlanInput({
  label,
  value,
  onChange
}: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  const id = `plan-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <label className="stacked-input" htmlFor={id}>
      <span>{label}</span>
      <input id={id} className="text-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function PlanStatusRow({
  label,
  slot,
  status,
  onChange
}: Readonly<{
  label: string;
  slot: PlanSlot;
  status: PlanItemStatus;
  onChange: (slot: PlanSlot, status: PlanItemStatus) => void;
}>) {
  return (
    <div className="plan-status-row">
      <span>{label}</span>
      <div className="status-button-row">
        {(["open", "done", "skipped"] as PlanItemStatus[]).map((itemStatus) => (
          <button
            key={itemStatus}
            type="button"
            className="mini-action"
            aria-pressed={status === itemStatus}
            onClick={() => onChange(slot, itemStatus)}
            data-testid={`plan-${slot}-${itemStatus}`}
          >
            {itemStatus}
          </button>
        ))}
      </div>
    </div>
  );
}

function EveningClosePanel({
  close,
  onSave
}: Readonly<{ close: EveningClose | null; onSave: (close: EveningClose) => void }>) {
  const [draft, setDraft] = useState({
    completed: close?.completed ?? "",
    missed: close?.missed ?? "",
    why: close?.why ?? "",
    recovery_impact: close?.recovery_impact ?? ("neutral" as RecoveryImpact),
    tomorrow_hint: close?.tomorrow_hint ?? ""
  });
  const [error, setError] = useState("");

  function saveClose() {
    if (!draft.completed.trim() && !draft.missed.trim() && !draft.tomorrow_hint.trim()) {
      setError("Add one useful close note before saving.");
      return;
    }

    setError("");
    onSave({
      ...draft,
      saved_at: new Date().toISOString()
    });
  }

  return (
    <section className="panel form-panel" aria-label="Evening close">
      <div className="section-heading-row">
        <div>
          <p className="kicker">Evening close</p>
          <h2 className="panel-title">{close ? "Close saved for today" : "Turn today into tomorrow's signal"}</h2>
        </div>
        <span className={close ? "state-pill state-pill-good" : "state-pill"}>{close ? "saved" : "open"}</span>
      </div>
      <PlanInput label="What got done" value={draft.completed} onChange={(value) => setDraft((current) => ({ ...current, completed: value }))} />
      <PlanInput label="What slipped" value={draft.missed} onChange={(value) => setDraft((current) => ({ ...current, missed: value }))} />
      <label className="stacked-input" htmlFor="close-why">
        <span>Why</span>
        <textarea
          id="close-why"
          className="text-area compact-text-area"
          value={draft.why}
          onChange={(event) => setDraft((current) => ({ ...current, why: event.target.value }))}
          placeholder="Short reason, not a self-judgment"
        />
      </label>
      <SegmentedControl
        label="Recovery impact"
        value={draft.recovery_impact}
        options={recoveryImpactOptions}
        onChange={(recovery_impact) => setDraft((current) => ({ ...current, recovery_impact }))}
      />
      <PlanInput label="Tomorrow hint" value={draft.tomorrow_hint} onChange={(value) => setDraft((current) => ({ ...current, tomorrow_hint: value }))} />
      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : (
        <p className="field-help">Saving creates a local memory candidate. Nothing is sent to a server.</p>
      )}
      <button className="primary-action full-width" type="button" onClick={saveClose} data-testid="save-evening-close">
        Save evening close
      </button>
    </section>
  );
}

export function CaptureScreen() {
  const { state, storageStatus, storageMessage, setLocalState } = useLocalDemoState();
  const today = useMemo(() => deriveTodayView(state), [state]);
  const [kind, setKind] = useState<CaptureKind>("note");
  const [impact, setImpact] = useState<CaptureImpact>("uncertain");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function saveCapture() {
    const cleanLabel = label.trim();
    const cleanNote = note.trim();
    if (!cleanLabel && !cleanNote) {
      setError("Add a short label or note before saving a local capture.");
      return;
    }

    const now = new Date().toISOString();
    setError("");
    setLocalState((current) => ({
      ...current,
      captures: [
        {
          id: `capture-${Date.now()}`,
          kind,
          label: cleanLabel || labelForKind(kind),
          note: cleanNote,
          impact,
          created_at: now
        },
        ...current.captures
      ].slice(0, 25),
      updated_at: now
    }));
    setLabel("");
    setNote("");
  }

  return (
    <AppShell active="capture">
      <section className="screen two-column-screen" data-screen="capture-functional">
        <div className="screen-main">
          <ScreenHeader
            kicker="Capture"
            title="Save the signal before it disappears."
            copy="Captures are local demo records. They feed Patterns and Experiments without claiming backend sync."
          />
          <RuntimeNotice status={storageStatus} message={storageMessage} />

          <section className="panel form-panel" aria-label="Capture event">
            <div className="section-heading-row">
              <div>
                <p className="kicker">Quick capture</p>
                <h2 className="panel-title">One useful entry</h2>
              </div>
              <span className="state-pill">{today.freshness_summary[1].status}</span>
            </div>
            <fieldset className="chip-field">
              <legend>Type</legend>
              <div className="tile-grid">
                {captureKinds.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    className="capture-tile"
                    aria-pressed={kind === item.value}
                    onClick={() => setKind(item.value)}
                    data-testid={`capture-kind-${item.value}`}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.example}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <SegmentedControl label="Impact" value={impact} options={impactOptions} onChange={setImpact} />
            <label className="input-label" htmlFor="capture-label">
              Label
            </label>
            <input
              id="capture-label"
              className="text-input"
              value={label}
              placeholder="Example: morning walk"
              onChange={(event) => setLabel(event.target.value)}
            />
            <label className="input-label" htmlFor="capture-note">
              Note
            </label>
            <textarea
              id="capture-note"
              className="text-area"
              maxLength={240}
              placeholder="What happened, and when?"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            {error ? (
              <p className="error-message" role="alert">
                {error}
              </p>
            ) : (
              <p className="field-help">Saved captures stay local and update the derived demo surfaces.</p>
            )}
            <button className="primary-action full-width" type="button" onClick={saveCapture} data-testid="save-capture">
              Save capture
            </button>
          </section>
        </div>

        <aside className="screen-aside" aria-label="Captured signals">
          <section className="panel" aria-label="Capture list">
            <div className="section-heading-row">
              <div>
                <p className="kicker">History</p>
                <h2 className="panel-title">{state.captures.length ? "Local captures" : "Nothing captured yet"}</h2>
              </div>
              <span className="state-pill">{state.captures.length}</span>
            </div>
            {state.captures.length ? (
              <ul className="event-list">
                {state.captures.map((event) => (
                  <li key={event.id} className="event-item">
                    <span className="event-kind">{labelForKind(event.kind)}</span>
                    <strong>{event.label}</strong>
                    {event.note ? <span>{event.note}</span> : null}
                    <span className="event-impact">{event.impact}</span>
                    <time>{formatShortTime(event.created_at)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-copy">Use the form to create a local event. Nothing is sent to a server.</p>
            )}
          </section>
        </aside>
      </section>
    </AppShell>
  );
}

export function PatternsScreen() {
  const { state, storageStatus, storageMessage, setLocalState } = useLocalDemoState();
  const today = useMemo(() => deriveTodayView(state), [state]);

  function setPatternDecision(patternId: string, status: PatternDecisionStatus) {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      pattern_decisions: [
        { pattern_id: patternId, status, updated_at: now },
        ...current.pattern_decisions.filter((decision) => decision.pattern_id !== patternId)
      ].slice(0, 20),
      updated_at: now
    }));
  }

  function startExperimentFromPattern(card: PatternCard) {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      experiment: createExperimentFromPattern(card, now),
      updated_at: now
    }));
  }

  return (
    <AppShell active="patterns">
      <section className="screen two-column-screen" data-screen="patterns-functional">
        <div className="screen-main">
          <ScreenHeader
            kicker="Patterns"
            title="Only show patterns the local data can support."
            copy="This page derives weak demo candidates from saved check-ins and captures. It avoids causal or medical claims."
          />
          <RuntimeNotice status={storageStatus} message={storageMessage} />
          <section className="panel primary-panel" aria-label="Pattern readiness">
            <p className="kicker">Readiness</p>
            <h2 className="panel-title">{today.pattern_summary.title}</h2>
            <p className="panel-copy">{today.pattern_summary.detail}</p>
          </section>
          {today.pattern_summary.ready ? (
            <section className="panel" aria-label="Emerging pattern candidate">
              <div className="section-heading-row">
                <div>
                  <p className="kicker">Pattern cards</p>
                  <h2 className="panel-title">Manual evidence worth watching</h2>
                </div>
                <span className="state-pill">{today.pattern_cards.length}</span>
              </div>
              <div className="pattern-card-list">
                {today.pattern_cards.map((card) => (
                  <article className={card.decision === "rejected" ? "pattern-card pattern-card-muted" : "pattern-card"} key={card.id}>
                    <div className="section-heading-row">
                      <div>
                        <h3>{card.title}</h3>
                        <p>{card.evidence_count} local evidence point{card.evidence_count === 1 ? "" : "s"} in {card.window_label}</p>
                      </div>
                      <span className="state-pill">{card.confidence}</span>
                    </div>
                    <p className="panel-copy">Confounders: {card.confounders.join(", ")}.</p>
                    <div className="action-row">
                      <button className="secondary-action" type="button" onClick={() => setPatternDecision(card.id, "watching")} data-testid={`pattern-watch-${card.id}`}>
                        Watch
                      </button>
                      <button className="secondary-action" type="button" onClick={() => setPatternDecision(card.id, "confirmed")} data-testid={`pattern-confirm-${card.id}`}>
                        Confirm
                      </button>
                      <button className="secondary-action" type="button" onClick={() => setPatternDecision(card.id, "rejected")} data-testid={`pattern-reject-${card.id}`}>
                        Reject
                      </button>
                      <button
                        className="primary-action"
                        type="button"
                        disabled={Boolean(state.experiment?.status === "active") || card.decision === "rejected"}
                        onClick={() => startExperimentFromPattern(card)}
                        data-testid={`pattern-start-experiment-${card.id}`}
                      >
                        Start experiment
                      </button>
                    </div>
                    {card.decision ? <p className="field-help">Decision: {card.decision}. You can change it while this stays local.</p> : null}
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="panel empty-state" aria-label="Needs more data">
              <h2 className="panel-title">Needs one more local signal</h2>
              <p className="panel-copy">Save a check-in and a capture first. Pattern actions stay unavailable until then.</p>
              <button className="secondary-action" type="button" disabled>
                Start experiment locked
              </button>
              <p className="field-help">Locked because local evidence is still missing.</p>
            </section>
          )}
        </div>
        <aside className="screen-aside">
          <FreshnessPanel items={today.freshness_summary} />
        </aside>
      </section>
    </AppShell>
  );
}

export function ExperimentsScreen() {
  const { state, storageStatus, storageMessage, setLocalState } = useLocalDemoState();
  const today = useMemo(() => deriveTodayView(state), [state]);
  const activeExperiment = state.experiment?.status === "active" ? state.experiment : null;
  const canStart = today.pattern_summary.ready && !activeExperiment;

  function startExperiment() {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      experiment: createExperimentFromPattern(today.pattern_cards[0], now),
      experiment_started_at: now,
      updated_at: now
    }));
  }

  function stopExperiment(status: "stopped" | "inconclusive") {
    const now = new Date().toISOString();
    setLocalState((current) => ({
      ...current,
      experiment: current.experiment
        ? {
            ...current.experiment,
            status,
            stopped_at: now,
            result_note:
              status === "inconclusive"
                ? "Not enough local evidence yet. Keep watching without changing routines."
                : "Stopped by user before conclusion."
          }
        : null,
      experiment_started_at: null,
      updated_at: now
    }));
  }

  return (
    <AppShell active="experiments">
      <section className="screen two-column-screen" data-screen="experiments-functional">
        <div className="screen-main">
          <ScreenHeader
            kicker="Experiments"
            title="Turn a weak signal into a cautious local test."
            copy="Experiments here are local demo plans. They do not automate reminders, dosage, or medical decisions."
          />
          <RuntimeNotice status={storageStatus} message={storageMessage} />

          {activeExperiment ? (
            <section className="panel primary-panel" aria-label="Active local experiment">
              <div className="section-heading-row">
                <div>
                  <p className="kicker">Active</p>
                  <h2 className="panel-title">{activeExperiment.hypothesis}</h2>
                </div>
                <span className="state-pill state-pill-good">local</span>
              </div>
              <p className="panel-copy">
                {activeExperiment.intervention} Target: {activeExperiment.target_signal}. Minimum window: {activeExperiment.minimum_window_days} days.
              </p>
              <p className="field-help">Stop condition: {activeExperiment.stop_condition}</p>
              <div className="action-row">
                <button className="secondary-action" type="button" onClick={() => stopExperiment("inconclusive")} data-testid="mark-inconclusive">
                  Mark inconclusive
                </button>
                <button className="secondary-action" type="button" onClick={() => stopExperiment("stopped")} data-testid="stop-experiment">
                  Stop local experiment
                </button>
              </div>
            </section>
          ) : (
            <section className="panel primary-panel" aria-label="Experiment builder">
              <div className="section-heading-row">
                <div>
                  <p className="kicker">Builder</p>
                  <h2 className="panel-title">Protect energy for three mornings</h2>
                </div>
                <span className={canStart ? "state-pill state-pill-good" : "state-pill"}>{canStart ? "ready" : "locked"}</span>
              </div>
              <p className="panel-copy">
                {today.experiment_summary.detail} Safety caveat: this is a local wellness note, not treatment advice.
              </p>
              <button
                className="primary-action"
                type="button"
                disabled={!canStart}
                onClick={startExperiment}
                data-testid="start-experiment"
              >
                Start local experiment
              </button>
              {!canStart ? <p className="field-help">Save a check-in and one capture to unlock this local test.</p> : null}
            </section>
          )}
          {state.experiment && state.experiment.status !== "active" ? (
            <section className="panel" aria-label="Experiment result">
              <p className="kicker">Result</p>
              <h2 className="panel-title">{today.experiment_summary.title}</h2>
              <p className="panel-copy">{today.experiment_summary.detail}</p>
            </section>
          ) : null}
        </div>
        <aside className="screen-aside">
          <section className="panel">
            <p className="kicker">Guardrails</p>
            <h2 className="panel-title">No fake automation</h2>
            <p className="panel-copy">No reminders, external sends, AI coaching, or backend writes are enabled here.</p>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}

export function ProfileScreen() {
  const { state, storageStatus, storageMessage, resetLocalState } = useLocalDemoState();
  const [exportStatus, setExportStatus] = useState<{ tone: "idle" | "success" | "error"; message: string }>({
    tone: "idle",
    message: "Export stays on this device until you choose where to save it."
  });
  const exportPreview = useMemo(() => serializeLocalDemoExport(state, state.updated_at ?? "not-exported-yet"), [state]);

  function createFreshExportJson() {
    return serializeLocalDemoExport(state, new Date().toISOString());
  }

  function downloadLocalExport() {
    if (typeof window === "undefined") return;

    try {
      const blob = new Blob([createFreshExportJson()], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lifemax-local-demo-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setExportStatus({ tone: "success", message: "Download prepared. The file contains only this browser's local demo data." });
    } catch {
      setExportStatus({ tone: "error", message: "Download failed in this browser. The preview below still shows the export JSON." });
    }
  }

  async function copyLocalExport() {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setExportStatus({ tone: "error", message: "Clipboard access is unavailable here. Use Download local JSON instead." });
      return;
    }

    try {
      await navigator.clipboard.writeText(createFreshExportJson());
      setExportStatus({ tone: "success", message: "Copied local demo JSON to clipboard. Nothing was sent to a server." });
    } catch {
      setExportStatus({ tone: "error", message: "Copy failed in this browser. Use Download local JSON instead." });
    }
  }

  return (
    <AppShell active="profile">
      <section className="screen two-column-screen" data-screen="profile-functional">
        <div className="screen-main">
          <ScreenHeader
            kicker="Profile"
            title="Local app truth and data controls."
            copy="This surface shows what is stored, what is disabled, and what must be built before beta or daily-use claims."
          />
          <RuntimeNotice status={storageStatus} message={storageMessage} />
          <section className="panel" aria-label="Local data summary">
            <StatusGrid
              items={[
                { label: "Check-in", value: state.check_in ? "saved" : "empty" },
                { label: "Plan", value: state.daily_plan ? deriveTodayView(state).plan_summary.progress_label : "empty" },
                { label: "Close", value: state.evening_close ? "saved" : "open" },
                { label: "Captures", value: String(state.captures.length) },
                { label: "Memories", value: String(state.memory_candidates.length) },
                { label: "Experiment", value: state.experiment?.status ?? "none" }
              ]}
            />
          </section>

          <section className="panel" aria-label="Data controls">
            <div className="section-heading-row">
              <div>
                <p className="kicker">Controls</p>
                <h2 className="panel-title">Browser-local demo data</h2>
              </div>
              <span className="state-pill">local only</span>
            </div>
            <p className="panel-copy">
              Export and reset apply only to this browser demo state. They do not touch Postgres, Telegram, n8n, WHOOP, Grok, public MCP, or backend records.
            </p>
            <div className="action-row data-action-row">
              <button className="primary-action" type="button" onClick={downloadLocalExport} data-testid="download-local-export">
                Download local JSON
              </button>
              <button className="secondary-action" type="button" onClick={() => void copyLocalExport()} data-testid="copy-local-export">
                Copy JSON
              </button>
              <button className="secondary-action" type="button" onClick={resetLocalState} data-testid="reset-local">
                Reset local demo
              </button>
              <a className="secondary-action" href="/privacy">
                Open privacy
              </a>
            </div>
            <p className={`export-status export-status-${exportStatus.tone}`} role="status">
              {exportStatus.message}
            </p>
          </section>
        </div>

        <aside className="screen-aside">
          <section className="panel" aria-label="Source status">
            <p className="kicker">Sources</p>
            <h2 className="panel-title">Not connected by design</h2>
            <ul className="source-list">
              {["WHOOP", "Account sync", "Hosted AI", "Backend writes"].map((item) => (
                <li className="source-item" key={item}>
                  <span className="source-name">{item}</span>
                  <span className="source-pill">disabled</span>
                </li>
              ))}
            </ul>
          </section>
          <details className="panel export-panel" aria-label="Local export preview">
            <summary>View local export preview</summary>
            <pre>{exportPreview}</pre>
          </details>
        </aside>
      </section>
    </AppShell>
  );
}

export function PrivacyScreen() {
  return (
    <AppShell active="profile">
      <section className="screen two-column-screen" data-screen="privacy">
        <div className="screen-main">
          <ScreenHeader
            kicker="Privacy"
            title="Privacy policy and local data boundary."
            copy="This policy describes the current app shell truth, not future backend promises."
          />
          <section className="panel legal-panel">
            <p className="kicker">Last updated</p>
            <h2 className="panel-title">June 19, 2026</h2>
            <p className="panel-copy">
              LifeMax currently stores the demo check-in, captures, plan status, and local experiment status in this browser only.
            </p>
          </section>
          <section className="panel legal-panel">
            <h2 className="panel-title">Local product data</h2>
            <p className="panel-copy">
              The higher-functionality demo can store a daily plan, evening close, memory candidates, pattern decisions, and one local experiment. These are browser-local records.
            </p>
          </section>
          <section className="panel legal-panel">
            <h2 className="panel-title">What is not connected here</h2>
            <p className="panel-copy">
              This app shell does not connect WHOOP, accounts, hosted AI, Telegram, n8n, public MCP, or production backend writes.
            </p>
          </section>
          <section className="panel legal-panel">
            <h2 className="panel-title">Wellness and safety claims</h2>
            <p className="panel-copy">
              LifeMax is for personal wellness reflection. It does not diagnose, treat, prescribe, or replace qualified medical advice.
            </p>
          </section>
          <section className="panel legal-panel">
            <h2 className="panel-title">Before beta</h2>
            <p className="panel-copy">
              Real export/delete, auth isolation, redacted logging, consent, and reviewed privacy copy must exist before external users or live health-data claims.
            </p>
          </section>
        </div>
        <aside className="screen-aside">
          <section className="panel">
            <p className="kicker">Reachability</p>
            <h2 className="panel-title">Linked from app chrome</h2>
            <p className="panel-copy">Privacy is reachable from the top bar, desktop side navigation, and Profile controls.</p>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}

function RuntimeNotice({ status, message }: Readonly<{ status: StorageStatus; message: string }>) {
  return (
    <section className={`runtime-notice runtime-notice-${status}`} aria-label="Runtime status">
      <strong>{status === "ready" ? "Local cache ready" : status === "loading" ? "Loading local cache" : "Local cache issue"}</strong>
      <span>{message}</span>
    </section>
  );
}

function FreshnessPanel({
  items
}: Readonly<{ items: Array<{ label: string; status: string; detail: string }> }>) {
  return (
    <section className="panel" aria-label="Source freshness">
      <p className="kicker">Freshness</p>
      <h2 className="panel-title">Source status</h2>
      <ul className="source-list">
        {items.map((item) => (
          <li className="source-item" key={item.label}>
            <span>
              <span className="source-name">{item.label}</span>
              <span className="source-note">{item.detail}</span>
            </span>
            <span className={`source-pill source-pill-${item.status}`}>{item.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SegmentedControl<TValue extends string>({
  label,
  value,
  options,
  onChange
}: Readonly<{
  label: string;
  value: TValue;
  options: Array<{ value: TValue; label: string }>;
  onChange: (value: TValue) => void;
}>) {
  return (
    <fieldset className="segmented-field">
      <legend>{label}</legend>
      <div className="segmented-control">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className="segment-button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function useLocalDemoState() {
  const rawSnapshot = useSyncExternalStore(subscribeLocalDemoStorage, getLocalDemoSnapshot, getServerSnapshot);
  const [writeStatus, setWriteStatus] = useState<StorageStatus>("ready");
  const state = useMemo(() => readStoredLocalDemoState(rawSnapshot === storageErrorSnapshot ? null : rawSnapshot), [rawSnapshot]);
  const storageStatus: StorageStatus = rawSnapshot === storageErrorSnapshot || writeStatus === "error" ? "error" : "ready";

  function setLocalState(updater: (current: LocalDemoState) => LocalDemoState) {
    const next = updater(state);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(localDemoStorageKey, JSON.stringify(next));
        window.dispatchEvent(new Event(localDemoStorageEvent));
        setWriteStatus("ready");
      } catch {
        setWriteStatus("error");
      }
    }
  }

  function resetLocalState() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(localDemoStorageKey);
        window.dispatchEvent(new Event(localDemoStorageEvent));
        setWriteStatus("ready");
      } catch {
        setWriteStatus("error");
      }
    }
  }

  return {
    state,
    storageStatus,
    storageMessage:
      storageStatus === "ready"
        ? "Changes persist across refresh in this browser only."
        : "Browser storage is unavailable. The UI will still work until refresh.",
    setLocalState,
    resetLocalState
  };
}

const localDemoStorageEvent = "lifemax-local-demo-storage";
const storageErrorSnapshot = "__LIFEMAX_LOCAL_STORAGE_ERROR__";

function subscribeLocalDemoStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(localDemoStorageEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(localDemoStorageEvent, onStoreChange);
  };
}

function getLocalDemoSnapshot() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(localDemoStorageKey);
  } catch {
    return storageErrorSnapshot;
  }
}

function getServerSnapshot() {
  return null;
}

function labelForKind(kind: CaptureKind) {
  return captureKinds.find((item) => item.value === kind)?.label ?? "Note";
}

function createExperimentFromPattern(card: PatternCard | undefined, startedAt: string) {
  return {
    id: `experiment-${Date.now()}`,
    pattern_id: card?.id ?? "local-pattern-energy",
    hypothesis: card?.title ?? "A smaller morning plan may reduce friction.",
    intervention: "Keep one must-do, protect the first useful block, and capture any energy shift.",
    target_signal: "energy, friction, and follow-through",
    minimum_window_days: 3,
    stop_condition: "Stop if the experiment adds pressure, worsens symptoms, or crowds out recovery.",
    status: "active" as const,
    started_at: startedAt,
    stopped_at: null,
    result_note: null
  };
}
