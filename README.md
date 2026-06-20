# LifeMax Web

LifeMax is a mobile-first private beta app shell for local wellness reflection, daily planning, capture, patterns, and cautious local experiments.

This repository is intentionally standalone and Vercel-ready. It is not the full LifeMax dogfood product and does not include the control-plane repo, WHOOP OAuth activation, live wearable data, auth, database persistence, automation runtimes, assistant connectors, chat delivery, or production services.

## What Is Included

- Next.js App Router PWA shell.
- Today command center with local check-in, daily plan, evening close, memory candidate, and source freshness.
- Capture, Patterns, Experiments, Profile, and Privacy routes.
- Browser-local persistence via `localStorage`.
- PWA manifest and public icon.
- Local Vitest, ESLint, TypeScript, and Playwright visual smoke checks.

## Local Commands

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
npm run test:pwa
npm run test:fixtures
npm run screenshot:mobile
```

Screenshots from `screenshot:mobile` are written under `reports/screenshots/`.

## Vercel

- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: Vercel default for Next.js
- Environment variables: none required for this app shell and privacy page

## Boundaries

- LifeMax is in private development/private beta.
- The app shell does not display fake live WHOOP data.
- The app shell does not connect accounts, hosted AI, Telegram, n8n, public MCP, or backend writes.
- The app shell does not provide diagnosis, treatment, or medical advice.
- No app-local environment file is required.
- Do not add secrets, OAuth tokens, raw health payloads, private ops reports, or generated build artifacts to this repo.
