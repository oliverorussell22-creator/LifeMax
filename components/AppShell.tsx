"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tabs, type TabId } from "@/lib/contracts";

export function AppShell({ active, children }: Readonly<{ active: TabId; children: React.ReactNode }>) {
  return (
    <div className="app-frame">
      <div className="phone-shell">
        <header className="top-bar">
          <div className="brand-row">
            <div className="brand-mark">
              <p className="brand-title">LifeMax</p>
              <p className="brand-subtitle">Private health memory</p>
            </div>
            <span className="stage-badge">Private beta shell</span>
          </div>
        </header>
        <main className="content">{children}</main>
        <BottomNav active={active} />
      </div>
    </div>
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
