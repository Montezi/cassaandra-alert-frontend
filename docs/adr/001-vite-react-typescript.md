# ADR-001: Vite + React + TypeScript single-page app

- Status: Accepted
- Date: 2026-11-14

## Context

The app shows radar results that a Python pipeline writes as static files.
It has no user accounts and no server-side pages, and it must work on simple
phones over slow 4G. The team knows React well, and the deadline is
15 Nov 2026, 23:59.

## Options considered

- **Vite + React SPA (chosen):** static output, a fast dev server, and the stack the team already knows.
- **Next.js:** brings server rendering and API routes we do not need, and pulls hosting toward a Node server, while `/api` already lives in Cloud Run (ADR-002).
- **Astro:** built for content pages. This app is one interactive screen, so it would be a React island inside an extra framework.

## Decision

- A single-page app built with **Vite 8 + React 19 + TypeScript** in `strict`
  mode. No Next.js: there is nothing to render on a server.
- **TypeScript 6.0**, not 7: typescript-eslint does not support 7 yet.
- **ESLint 9** with type-aware typescript-eslint, react-hooks, react-refresh
  and jsx-a11y, plus Prettier. ESLint 10 waits for jsx-a11y.
- State that must survive a shared link (hotspot, date, lens, polarization,
  language) lives in the URL query string, through a small `useUrlParam` hook.
  No router library: the app has two pages (`/` landing, `/app` map), chosen
  by a tiny `usePathname` + `navigate` pair in `shared/lib/urlState.ts` and
  an internal `<Link>`. Firebase Hosting already sends every path to
  `index.html`. Revisit if a third page needs nested routes or loaders.
- Heavy parts load on demand with `React.lazy`: each page, the map, the
  technical mode (with Recharts), the chat and the WhatsApp alert.

## Consequences

- `npm run build` produces static files in `dist/` that any static host can
  serve.
- No server rendering. That is fine here, because people open shared links
  directly rather than finding the app through search.
- Upgrade to TypeScript 7 and ESLint 10 once the plugins support them.
