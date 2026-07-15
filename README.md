# PriorAuthFlow — Next Byte Hacks V3

A callable, working prior-authorization automation demo. Paste a patient chart + payer + CPT
code and watch a 5-agent pipeline build a submit-ready PA packet — or flag missing data for
clinician review **before** submission (preventing the ~68% of denials caused by missing info).

## Architecture

- **GitHub Pages** serves the static frontend (`public/`) — the primary deployment.
- **Shared pipeline** (`src/pipeline/`, TypeScript, framework-agnostic) is the single source of
  truth. It is unit-tested with vitest and bundled to `public/pipeline.js` for the browser.
- **Supabase (serverless)** — an Edge Function `run-pipeline` runs the same pipeline server-side
  and persists results to a `pa_requests` table. When `SUPABASE_URL` / `SUPABASE_ANON_KEY` are
  configured (injected into `public/config.js` at deploy), the demo calls the edge function;
  otherwise it runs the bundled pipeline client-side so the demo **always works**.

```
chart+code ─▶ Intake ─▶ Chart-Retriever ─▶ Criteria-Matcher ─▶ Evidence-Builder
                 ─▶ [missing?] Escalation (human review)  [complete?] Submitter (ePA)
                 ─▶ typed Deliverable (packet + traces)
```

## Local development

```bash
npm install
npm test                 # vitest unit tests for the pipeline
npm run build            # bundle src/pipeline -> public/pipeline.js
npm run dev              # serve the demo at http://localhost:4173
npm run test:e2e         # puppeteer end-to-end check (needs a browser)
```

## Deploy

1. **GitHub Pages** (frontend): push to `main`; the `Deploy to GitHub Pages` workflow builds the
   bundle, injects `public/config.js` from the `SUPABASE_URL` / `SUPABASE_ANON_KEY` repo secrets
   (leave empty for local-demo mode), and publishes `public/`.
2. **Supabase** (serverless backend, optional): in repo Settings → Secrets add
   `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_SERVICE_ROLE_KEY`. Run the
   `Deploy Supabase` workflow to push the `pa_requests` schema and deploy the `run-pipeline`
   Edge Function. Reuse the same Supabase project as the live agent hack.

## Project layout

```
src/pipeline/        # shared, unit-tested pipeline (types, lib, agent/*)
src/tests/           # pipeline.test.ts (unit) + e2e.test.ts (puppeteer)
public/              # static frontend (index.html, config.js, pipeline.js, app.js)
supabase/            # migrations + functions/run-pipeline (serverless)
.github/workflows/   # pages.yml, supabase.yml
```
