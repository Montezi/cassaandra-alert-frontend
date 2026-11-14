# ADR-002: Firebase Hosting for the app, Cloud Run for /api

- Status: Accepted
- Date: 2026-11-14

## Context

The app is static, but two features need a server that holds secrets: the
Cass agent (LLM key) and the weather proxy (Meteomatics key). No key may
reach the browser. The app must use relative paths and open without login.

## Decision

- **Firebase Hosting** serves `dist/`, including the pipeline files under
  `/dados`.
- Two **Cloud Run** services, `agente` and `clima`, in `us-central1`, are
  reached through Hosting rewrites of `/api/agente` and `/api/clima`
  (`firebase.json`). The app and the API share one origin, so the app needs no
  CORS setup and uses only relative paths.
- Keys live in **Secret Manager**, and only Cloud Run reads them.
- During development, Vite forwards `/api` to `API_PROXY_TARGET` (default
  `http://localhost:8080`). The variable has no `VITE_` prefix, so it stays
  out of the bundle.
- Caching: `/dados/**` and `/assets/**` are cached for one year
  (`immutable`), and `index.html` is never cached. The app requests pipeline
  files as `/dados/<file>?v=<commit>`, so every deploy gets fresh URLs.
- CI (GitHub Actions) runs lint, typecheck and build on pull requests and on
  `main`. Deploy is manual (`workflow_dispatch` on `main`) until the Cloud Run
  services exist, because Firebase rejects rewrites to missing services. The
  service account key is the `FIREBASE_SERVICE_ACCOUNT` repository secret.

## Consequences

- The Cloud Run services receive the full path (`/api/agente`, also through
  the dev proxy) and must route it.
- Hosting gives up on a Cloud Run request after 60 seconds, so agent
  replies must finish within that time.
- New pipeline data reaches users only through a deploy from a new commit;
  the commit hash is what changes the `?v=` URLs.
- `alerta-cassandra` in `.firebaserc` and `ci.yml` is a placeholder. Project
  IDs are global, so the real ID may differ. Update both files when the
  project is created.
