# API contract: `/api/agente` and `/api/clima`

What the frontend sends and expects. Both services run on Cloud Run and are
reached through Firebase Hosting rewrites (ADR-002), so the app always calls
relative paths. Zod schemas: `src/features/cass/agentApi.ts` and
`src/shared/lib/forecastSchema.ts`.

## `POST /api/agente` (ADR-005)

Request:

```json
{ "question": "O que mudou no Guaíba?", "hotspot_id": "guaiba-rs", "language": "pt" }
```

Response `200`, `application/json`:

```json
{
  "paragraphs": ["Entre jan e 12 nov, o radar mediu **212 km²** de água nova…"],
  "tools": ["consultar_hotspot", "explicar_classe"],
  "sources": ["NISAR GCOV, 12 nov 2026", "Sentinel-1, 11 nov 2026"],
  "note": null
}
```

- `**text**` marks bold (the measured number). No HTML: the app escapes it.
- Answer in `language` (`pt` or `en`). Keep Medido and Hipótese apart, and
  give the strength of any hypothesis.
- `note` is accepted but **not shown** by the chat. Put any caveat that
  matters (forecast uncertainty, "not proof of cause") in `paragraphs`, and
  do not repeat the sample-data warning in every answer: the panel already
  shows a "Sample data" badge.
- Request limits the server must enforce (the app applies the same ones):
  `question` at most **500 characters**, `hotspot_id` one of the ids in
  `hotspots.geojson`, `language` `pt` or `en`, body under 2 KB. Anything
  else answers `400`.
- Response limits the app validates: up to 12 `paragraphs` of 2000
  characters, 10 `tools` of 60 characters, 10 `sources` of 200 characters,
  `note` up to 500 characters. A larger answer counts as off-contract.
- The app waits **20 s**, then shows "Cass could not answer" with a retry.
  Hosting itself cuts requests at 60 s.

How the app reacts:

| Answer                                                                | App                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `200` JSON matching the schema                                        | Shows the answer.                                                  |
| `200` but not JSON or off-contract, `404`, `405`, `501`, `502`, `503` | **Demo mode**: answers built from `/dados`, with a visible notice. |
| Timeout, `500`, `504`, network error                                  | Error state with "Ask again".                                      |

## `GET /api/clima?hotspot=<id>&lat=<lat>&lon=<lon>` (ADR-006)

Response `200`, `application/json`:

```json
{
  "source": "meteomatics",
  "updated_at": "2026-11-14T09:00:00Z",
  "days": [{ "date": "2026-11-15", "precipitation_mm": 18 }]
}
```

- `source`: `meteomatics`, `open-meteo` (backup) or `snapshot` (last saved).
  The server tries them in that order.
- `days` holds 1 to 16 entries; a longer answer counts as off-contract.
- The app shows the source and `updated_at` next to the chart. A forecast
  older than 3 days is shown for reference only and never triggers the
  rain warning (CLAUDE.md rule 8).
- If the request fails or takes more than 8 s, the app reads
  `/dados/forecast-snapshot.json` instead and says so.
