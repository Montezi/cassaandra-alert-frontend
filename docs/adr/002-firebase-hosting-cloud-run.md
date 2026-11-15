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
- One **Cloud Run** service, `agente`, in `us-central1`, answers both
  `/api/agente` (Cass) and `/api/clima` (forecast), through two Hosting
  rewrites (`firebase.json`). They stay two rewrites, so `/api/clima` can move
  to its own service later by changing one `serviceId`. The app and the API
  share one origin, so the app needs no CORS setup and uses only relative
  paths.
- Keys live in **Secret Manager**, and only Cloud Run reads them.
- During development, Vite forwards `/api` to `API_PROXY_TARGET` (default
  `http://localhost:8080`). The variable has no `VITE_` prefix, so it stays
  out of the bundle.
- Caching: `/dados/**` and `/assets/**` are cached for one year
  (`immutable`), and `index.html` is never cached. The app requests pipeline
  files as `/dados/<file>?v=<commit>`, so every deploy gets fresh URLs.
- CI (GitHub Actions) runs lint, typecheck and build on pull requests and on
  `main`. **Every push to `main` deploys** to Firebase Hosting (live channel)
  once those checks pass. A manual run (`workflow_dispatch` on `main`)
  redeploys without a new commit.
- The deploy runs as the `github-deploy` service account through
  **Workload Identity Federation**: no key is stored anywhere (the project
  also forbids service account keys, `iam.disableServiceAccountKeyCreation`).
  Only `Montezi/cassaandra-alert-frontend` can use the pool's provider. The
  account has the roles Firebase Hosting Admin, Cloud Run Viewer (Firebase
  checks the services behind the `/api` rewrites) and API Keys Viewer.

## Consequences

- The Cloud Run services receive the full path (`/api/agente`, also through
  the dev proxy) and must route it.
- Hosting gives up on a Cloud Run request after 60 seconds, so agent
  replies must finish within that time.
- Merging into `main` publishes to production. Keep `main` deployable, and
  review changes in pull requests first.
- New pipeline data reaches users only through a deploy from a new commit;
  the commit hash is what changes the `?v=` URLs.
- Firebase refuses to deploy rewrites to Cloud Run services that do not
  exist, so `agente` must stay deployed. The old `clima` sample container is
  no longer used and can be deleted.
- The Google Cloud / Firebase project is `cassaandra-alert` (`.firebaserc`
  and `ci.yml`). Hosting and both Cloud Run services must live in this
  project, because Hosting rewrites only reach Cloud Run services of the
  same project.
