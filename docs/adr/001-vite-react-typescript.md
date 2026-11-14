# ADR-001: Vite + React + TypeScript single-page app

- Status: Accepted
- Date: 2026-11-14

## Context

The app shows radar results that a Python pipeline writes as static files.
It has no user accounts and no server-side pages, and it must work on simple
phones over slow 4G. The team knows React well, and the deadline is
15 Nov 2026, 23:59.

## Decision

- A single-page app built with **Vite 8 + React 19 + TypeScript** in `strict`
  mode. No Next.js: there is nothing to render on a server.
- **TypeScript 6.0**, not 7: typescript-eslint does not support 7 yet.
- **ESLint 9** with type-aware typescript-eslint, react-hooks, react-refresh
  and jsx-a11y, plus Prettier. ESLint 10 waits for jsx-a11y.
- State that must survive a shared link (hotspot, date, lens, polarization,
  language) lives in the URL query string, through a small `useUrlParam` hook.
  No router library until there is more than one page.
- Heavy parts load on demand with `React.lazy`: the map now, later the
  technical mode and the chat.

## Consequences

- `npm run build` produces static files in `dist/` that any static host can
  serve.
- No server rendering. That is fine here, because people open shared links
  directly rather than finding the app through search.
- Upgrade to TypeScript 7 and ESLint 10 once the plugins support them.
