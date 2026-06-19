import type { Wave0TodayState } from "./contracts";

export const emptyTodayState: Wave0TodayState = {
  schema_version: "today.v1",
  state: "uncertain",
  confidence: "low",
  intensity_cap: 1,
  primary_reason: "LifeMax has no current manual check-in or wearable source connected in this local scaffold.",
  recommended_move: {
    kind: "check_in",
    title: "Start with a short check-in.",
    reason: "A manual signal is enough to make the first loop useful without a wearable, AI, or legacy service."
  },
  recovery_boundary: {
    title: "Keep today small until the first signal exists.",
    detail: "LifeMax does not infer readiness from missing sources."
  },
  freshness_summary: [
    {
      source_kind: "manual",
      label: "Manual check-in",
      status: "missing",
      confidence_impact: "low",
      last_observed_at: null,
      display_note: "No check-in captured yet."
    },
    {
      source_kind: "apple_health_export",
      label: "Health export",
      status: "disabled",
      confidence_impact: "low",
      last_observed_at: null,
      display_note: "Import path deferred."
    },
    {
      source_kind: "goose_helper",
      label: "Goose helper",
      status: "disabled",
      confidence_impact: "low",
      last_observed_at: null,
      display_note: "Deferred until the helper path is proven."
    }
  ]
};
