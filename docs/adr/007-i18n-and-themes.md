# ADR-007: Internationalization (PT/EN) and light/dark themes

- Status: Accepted
- Date: 2026-11-14

## Context

The app is presented in Portuguese and English. No visible text and no color
or font may be hard-coded (CLAUDE.md). The brand palette has to reach WCAG AA
contrast in both themes.

## Decision

**Languages**

- **react-i18next**, with `pt.json` and `en.json` bundled in the app (they are
  small, so there is no HTTP backend and no loading state).
- Translation keys are typed (`i18next.d.ts`), so a misspelled key fails the
  typecheck. `en.json` must contain every key of `pt.json` (`satisfies`
  check in `shared/i18n/index.ts`).
- Initial language: `?lang=` in the URL, otherwise **English**, whatever the
  browser language (the judges and most visitors read English). The fallback
  for a missing key is English too. Switching language updates the URL,
  `<html lang>` and the page title.
- The basemap labels (countries, cities, seas) follow the language too:
  `localizeBasemap` rewrites the `text-field` of the style's symbol layers to
  `name:pt` or `name:en`, falling back to the local name.
- Text that comes with the data (hotspot names, El Niño effect) is stored in
  both languages: `{ "pt": "...", "en": "..." }` (docs/data-contract.md).

**Themes**

- `data-theme="claro|escuro"` on `<html>`.
- `shared/theme/tokens.css` has two layers:
  1. The brand palette plus a few derived shades.
  2. Semantic tokens (`--color-text`, `--color-action-bg`, ...) set per
     theme. Components use only semantic tokens.
- Some brand colors fail AA as text on the light background: `#328CC1`
  (3.5:1), `#2E8B57` (4.3:1) and `#FF6B35` (2.8:1). They are used for fills,
  and text uses the darker derived shades.
- On the first visit the theme follows `prefers-color-scheme`, including when
  the system setting changes. After the user picks a theme, the choice is kept
  in `localStorage` (`cassaandra.theme`). An inline script in `index.html`
  applies the theme before the first paint, so the page does not flash.
- Fonts: Red Hat Display (headings) and Red Hat Text (body), bundled with
  `@fontsource-variable`. They need no external request, and browsers
  download only the subsets a page uses.

## Consequences

- To add a language, add a JSON file and an entry in `LANGUAGES`.
- The theme is a personal preference, so it stays out of shared links.
- Code that needs a color outside CSS, such as MapLibre, reads it with
  `readToken('--color-...')`.
