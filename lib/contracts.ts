export type LifeState = "steady" | "low_energy" | "overloaded" | "recovering" | "uncertain" | "protect";
export type Confidence = "low" | "medium" | "high";
export type FreshnessStatus = "fresh" | "stale" | "missing" | "error" | "disabled";
export type TabId = "today" | "capture" | "patterns" | "experiments" | "profile";

export interface SourceFreshness {
  source_kind: "manual" | "apple_health_export" | "goose_helper" | "legacy_lifemax";
  label: string;
  status: FreshnessStatus;
  confidence_impact: Confidence;
  last_observed_at: string | null;
  display_note: string;
}

export interface Wave0TodayState {
  schema_version: "today.v1";
  state: LifeState;
  confidence: Confidence;
  intensity_cap: 0 | 1 | 2 | 3;
  primary_reason: string;
  recommended_move: {
    kind: "check_in" | "none";
    title: string;
    reason: string;
  };
  recovery_boundary: {
    title: string;
    detail: string;
  };
  freshness_summary: SourceFreshness[];
}

export const tabs: Array<{ id: TabId; label: string; href: string }> = [
  { id: "today", label: "Today", href: "/today" },
  { id: "capture", label: "Capture", href: "/capture" },
  { id: "patterns", label: "Patterns", href: "/patterns" },
  { id: "experiments", label: "Experiments", href: "/experiments" },
  { id: "profile", label: "Profile", href: "/profile" }
];

export const wave0CommandIds = [
  "install",
  "dev",
  "build",
  "typecheck",
  "lint",
  "test",
  "test:pwa",
  "test:fixtures",
  "screenshot:mobile"
] as const;

export const forbiddenWave0Dependencies = [
  "supabase",
  "prisma",
  "drizzle",
  "openai",
  "ai",
  "posthog",
  "whoop",
  "oura",
  "garmin",
  "goose"
] as const;
