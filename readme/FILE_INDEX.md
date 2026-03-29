# File index (source and config)

Generated-style inventory of **non-generated** project files (excluding `node_modules/`, `.git/`, `dist/`, `.venv/`). Use this to find where things live.

## Root

- `README.md` — short project entry
- `export_csv.py` — CSV export script

## `backend/`

- `main.py`
- `API.md`
- `requirements.txt`
- `routers/analyze.py`, `chat.py`, `predictions.py`, `reports.py`
- `services/chat_service.py`, `hermes_service.py`, `k2_service.py`, `mongo_service.py`
- `schemas/company.py`, `prediction.py`, `report.py`, `signal.py`

## `frontend/`

- `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `index.html`
- `src/main.tsx`, `App.tsx`, `index.css`
- `src/screens/SetupScreen.tsx`, `Dashboard.tsx`, `RegulatoryAnalysisScreen.tsx`, `RagChatScreen.tsx`
- `src/store/forseen-context.tsx`
- `src/data/mocks.ts`
- `src/lib/api.ts`, `persisted-session.ts`, `prediction-mapper.ts`, `us-states.ts`, `utils.ts`
- `src/components/icons.tsx`, `ProbabilityGauge.tsx`, `ProbTimeline.tsx`, `DrillDownModal.tsx`, `AlertsNotificationsPanel.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/ui/*.tsx` — accordion, badge, button, card, checkbox, dialog, input, label, progress, slider, tabs, textarea

## `model_servers/k2/`

- `main.py`
- `test_requests.py` (if present)

## `model_servers/hermes/`

- `main.py`
- `test_requests.py` (if present)

## `data_ingestion/`

- `main.py`, `backfill.py`
- `schema/mongo_collections.py`
- `pipeline/` — `deduplication.py`, `embeddings.py`, `enrich_summaries.py`, `entity_extraction.py`, `passage_probability.py`, `queries.py`, `realtime.py`, `velocity.py`
- `ingestors/` — `congress.py`, `federal_agencies.py`, `federal_register.py`, `ftc.py`, `google_alerts.py`, `hhs.py`, `news.py`, `reddit.py`, `state_legislatures.py`

## `scripts/`

- `run-local.sh`, `stop-local.sh`
- `test_pipeline.py`, `peek_mongo.py`

## `readme/` (this folder)

- `README.md` — narrative documentation
- `FILE_INDEX.md` — this file list
