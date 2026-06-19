# LifeMax Web

LifeMax is a mobile-first private beta app shell for personal health memory, daily planning, and wellness tracking.

This repository is intentionally standalone and Vercel-ready. It is not the full LifeMax dogfood product and does not include the control-plane repo, WHOOP OAuth activation, live wearable data, auth, database persistence, automation runtimes, assistant connectors, chat delivery, or production services.

## What Is Included

- Next.js App Router PWA shell
- Mobile-first LifeMax home screen
- Public privacy policy at `/privacy`
- PWA manifest and public icon
- Local Vitest, ESLint, TypeScript, Playwright visual smoke checks
- Public-safe proof packet at `reports/lifemax-vercel-ready-proof.json`

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

## Vercel Import Settings

- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: Vercel default for Next.js
- Environment variables: none required for this app shell and privacy page

No `vercel.json` is required for this repository.

## Boundaries

- LifeMax is in private development/private beta.
- The app shell does not display fake live WHOOP data.
- The app shell does not provide diagnosis, treatment, or medical advice.
- No app-local environment file is required.
- Do not add secrets, OAuth tokens, raw health payloads, private ops reports, or generated build artifacts to this repo.
