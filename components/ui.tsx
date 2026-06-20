import type { SourceFreshness } from "@/lib/contracts";

export function ScreenHeader({
  kicker,
  title,
  copy
}: Readonly<{ kicker: string; title: string; copy: string }>) {
  return (
    <header className="screen-header">
      <p className="kicker">{kicker}</p>
      <h1 className="screen-title">{title}</h1>
      <p className="screen-copy">{copy}</p>
    </header>
  );
}

export function EmptyState({
  title,
  copy,
  actionLabel,
  secondaryLabel
}: Readonly<{ title: string; copy: string; actionLabel: string; secondaryLabel?: string }>) {
  return (
    <section className="panel empty-state" aria-label={title}>
      <h2 className="empty-title">{title}</h2>
      <p className="empty-copy">{copy}</p>
      <div className="action-row">
        <span className="primary-action" role="button" aria-disabled="true">
          {actionLabel}
        </span>
        {secondaryLabel ? (
          <span className="secondary-action" role="button" aria-disabled="true">
            {secondaryLabel}
          </span>
        ) : null}
      </div>
    </section>
  );
}

export function StatusGrid({
  items
}: Readonly<{ items: Array<{ label: string; value: string }> }>) {
  return (
    <section className="status-grid" aria-label="Current state summary">
      {items.map((item) => (
        <div className="status-tile" key={item.label} aria-label={`${item.label}: ${item.value}`}>
          <span className="status-label">{item.label}</span>
          <span className="status-value">{item.value}</span>
        </div>
      ))}
    </section>
  );
}

export function SourceFreshnessList({ sources }: Readonly<{ sources: SourceFreshness[] }>) {
  return (
    <section className="panel" aria-label="Source freshness">
      <h2 className="empty-title">Source freshness</h2>
      <p className="source-note">Claims stay quiet until a source has freshness and confidence.</p>
      <ul className="source-list">
        {sources.map((source) => (
          <li className="source-item" key={source.source_kind}>
            <span>
              <span className="source-name">{source.label}</span>
              <span className="source-note">{source.display_note}</span>
            </span>
            <span className="source-pill">{source.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
