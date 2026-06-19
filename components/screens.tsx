import { AppShell } from "@/components/AppShell";
import { EmptyState, ScreenHeader, SourceFreshnessList, StatusGrid } from "@/components/ui";
import { emptyTodayState } from "@/lib/demo-state";

export function TodayScreen() {
  return (
    <AppShell active="today">
      <section className="screen" data-screen="today-empty">
        <ScreenHeader
          kicker="Today"
          title="LifeMax remembers the small signals around your day."
          copy="This private beta app shell is ready for Vercel import and privacy review. Live WHOOP sync, accounts, AI, and writes are not connected here."
        />
        <StatusGrid
          items={[
            { label: "Stage", value: "Private beta shell" },
            { label: "WHOOP", value: "Not connected" },
            { label: "Storage", value: "No writes" },
            { label: "Medical use", value: "Not medical advice" }
          ]}
        />
        <section className="panel panel-muted" aria-label="Recommended move">
          <h2 className="empty-title">{emptyTodayState.recommended_move.title}</h2>
          <p className="empty-copy">{emptyTodayState.recommended_move.reason}</p>
        </section>
        <section className="panel" aria-label="Recovery boundary">
          <h2 className="empty-title">{emptyTodayState.recovery_boundary.title}</h2>
          <p className="empty-copy">{emptyTodayState.recovery_boundary.detail}</p>
        </section>
        <SourceFreshnessList sources={emptyTodayState.freshness_summary} />
      </section>
    </AppShell>
  );
}

export function CaptureScreen() {
  return (
    <AppShell active="capture">
      <section className="screen" data-screen="capture-empty">
        <ScreenHeader
          kicker="Capture"
          title="Manual capture comes before integrations."
          copy="Supplements, habits, symptoms, and notes will start here once writes are enabled."
        />
        <EmptyState
          title="No events captured yet"
          copy="Use Today first so LifeMax can anchor captures to the right day."
          actionLabel="Capture not connected"
          secondaryLabel="Wearable not connected"
        />
      </section>
    </AppShell>
  );
}

export function PatternsScreen() {
  return (
    <AppShell active="patterns">
      <section className="screen" data-screen="patterns-empty">
        <ScreenHeader
          kicker="Patterns"
          title="Patterns wait for real repeated signals."
          copy="No causality claim appears until enough local observations and confidence gates exist."
        />
        <EmptyState
          title="No pattern candidates"
          copy="Pattern candidates stay hidden until daily state and capture history exist."
          actionLabel="Patterns not connected"
        />
      </section>
    </AppShell>
  );
}

export function ExperimentsScreen() {
  return (
    <AppShell active="experiments">
      <section className="screen" data-screen="experiments-empty">
        <ScreenHeader
          kicker="Experiments"
          title="Experiments start after trustworthy patterns."
          copy="Nothing starts here until there is a pattern worth testing."
        />
        <EmptyState
          title="No experiments"
          copy="A future agent must prove pattern confidence, reminders, and export/delete boundaries before beta use."
          actionLabel="Experiments not connected"
        />
      </section>
    </AppShell>
  );
}

export function ProfileScreen() {
  return (
    <AppShell active="profile">
      <section className="screen" data-screen="profile-empty">
        <ScreenHeader
          kicker="Profile"
          title="Local-only scaffold settings."
          copy="Account, provider sync, AI, and production connections are off."
        />
        <EmptyState
          title="Privacy gates before beta"
          copy="Export, delete, user isolation, secrets, and privacy-copy proof must exist before external users."
          actionLabel="Export not built"
          secondaryLabel="Delete not built"
        />
      </section>
    </AppShell>
  );
}
