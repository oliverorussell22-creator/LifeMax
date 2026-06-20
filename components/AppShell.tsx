"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tabs, type TabId } from "@/lib/contracts";

export function AppShell({ active, children }: Readonly<{ active: TabId; children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <div className="app-shell">
        <header className="top-bar">
          <div className="brand-row">
            <div className="brand-mark">
              <p className="brand-title">LifeMax</p>
              <p className="brand-subtitle">Private daily loop</p>
            </div>
            <div className="top-actions">
              <Link
                href="/privacy"
                className="privacy-link"
                aria-current={pathname === "/privacy" ? "page" : undefined}
              >
                Privacy
              </Link>
              <span className="stage-badge">Local demo</span>
            </div>
          </div>
          <StatusStrip />
          <BottomNav active={active} />
        </header>
        <div className="workspace">
          <DesktopNav active={active} />
          <main className="content">{children}</main>
        </div>
      </div>
    </div>
  );
}

function StatusStrip() {
  return (
    <section className="status-strip" aria-label="App status">
      <span>
        <strong>Mode</strong>
        Local browser storage
      </span>
      <span>
        <strong>Sync</strong>
        Not connected
      </span>
      <span>
        <strong>Claims</strong>
        Wellness notes only
      </span>
    </section>
  );
}

function DesktopNav({ active }: Readonly<{ active: TabId }>) {
  const pathname = usePathname();

  return (
    <aside className="side-nav" aria-label="Section navigation">
      <nav className="side-nav-list" aria-label="Primary sections">
        {tabs.map((tab) => {
          const isActive = active === tab.id || pathname === tab.href;
          return (
            <Link key={tab.id} href={tab.href} className="side-nav-link" aria-current={isActive ? "page" : undefined}>
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <Link href="/privacy" className="side-privacy-link" aria-current={pathname === "/privacy" ? "page" : undefined}>
        Privacy and data handling
      </Link>
    </aside>
  );
}

function BottomNav({ active }: Readonly<{ active: TabId }>) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map((tab) => {
        const isActive = active === tab.id || pathname === tab.href;
        return (
          <Link key={tab.id} href={tab.href} className="nav-link" aria-current={isActive ? "page" : undefined}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
