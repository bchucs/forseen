# Forseen — project documentation

The main **GitHub-style** overview (features, install, quick start, API snippet) lives at **[`../README.md`](../README.md)** in the repo root.

This folder is the **deeper technical map** of the codebase. For HTTP details, see [`../backend/API.md`](../backend/API.md).

## Quick start

From the repo root:

```bash
./scripts/run-local.sh
```

This brings up **K2** (8001), **Hermes** (8002), the **FastAPI backend** (8000), and the **Vite dev server** (5175). Logs and PIDs live under `.logs/`. Stop with `./scripts/stop-local.sh`.

**Requirements:** Python 3.11+, Node/npm, optional MongoDB on `localhost:27017` (the script can start Docker `mongo:7` as `forseen-mongo` if needed).

---

## Top-level layout

| Path | Role |
|------|------|
| `frontend/` | React 19 + TypeScript + Vite + Tailwind v4 UI (`forseen` package) |
| `backend/` | FastAPI app: `/analyze`, chat, predictions, reports; talks to Mongo + model servers |
| `model_servers/k2/` | Uvicorn service: prediction / reasoning pipeline for analyze |
| `model_servers/hermes/` | Uvicorn service: report generation |
| `data_ingestion/` | Pipelines and ingestors (news, registers, Reddit, etc.) → Mongo |
| `scripts/` | `run-local.sh`, `stop-local.sh`, pipeline/mongo helpers |
| `export_csv.py` | Standalone export utility |

---

## Frontend (`frontend/`)

| Area | Contents |
|------|-----------|
| `src/App.tsx` | Routes / view switching |
| `src/main.tsx` | React bootstrap |
| `src/index.css` | Tailwind import + CSS variables (accent, page, elevated surfaces) |
| `src/screens/` | `SetupScreen` (company profile wizard), `Dashboard`, `RegulatoryAnalysisScreen`, `RagChatScreen` |
| `src/store/forseen-context.tsx` | Global state: company profile, analysis results, persisted session sync |
| `src/lib/api.ts` | `postAnalyze`, response normalization |
| `src/lib/persisted-session.ts` | `localStorage` session versioning + migrations |
| `src/lib/prediction-mapper.ts` | Maps API predictions/signals to UI types |
| `src/lib/us-states.ts` | US state codes + sort + “all selected” helper |
| `src/lib/utils.ts` | `cn()` etc. |
| `src/data/mocks.ts` | Default company, mock predictions, types shared with backend shape |
| `src/components/ui/` | Radix-based primitives (button, dialog, input, …) |
| `src/components/layout/AppShell.tsx` | App chrome, nav |
| `src/components/` | `DrillDownModal`, `ProbabilityGauge`, `AlertsNotificationsPanel`, icons |
| `public/` | Static assets (logos, marks) |
| `vite.config.ts` | Dev server (e.g. port **5175** in local script) |

**Commands:** `npm install`, `npm run dev`, `npm run build`, `npm run lint` (from `frontend/`).

---

## Backend (`backend/`)

| Path | Role |
|------|------|
| `main.py` | FastAPI app, CORS, router includes |
| `routers/analyze.py` | Orchestrates signal fetch + K2 + Hermes |
| `routers/chat.py` | RAG / chat |
| `routers/predictions.py`, `routers/reports.py` | Prediction and report APIs |
| `services/k2_service.py`, `hermes_service.py`, `mongo_service.py`, `chat_service.py` | Integrations |
| `schemas/` | Pydantic models: `company`, `prediction`, `report`, `signal` |
| `requirements.txt` | Python dependencies |
| `API.md` | Endpoint reference and examples |

---

## Model servers (`model_servers/`)

| Directory | Port (local script) | Role |
|-----------|---------------------|------|
| `k2/` | 8001 | K2 model HTTP API (`main.py`) |
| `hermes/` | 8002 | Hermes report model API (`main.py`) |

Each is a small FastAPI/Uvicorn app with its own `.env` as needed.

---

## Data ingestion (`data_ingestion/`)

- `main.py`, `backfill.py` — orchestration
- `pipeline/` — embeddings, deduplication, entity extraction, probabilities, queries, etc.
- `ingestors/` — federal register, agencies, Congress, state legislatures, news, Reddit, HHS, FTC, Google Alerts, …
- `schema/mongo_collections.py` — collection expectations

---

## Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `run-local.sh` | Full stack: venv, deps, Mongo check, free ports, start K2, Hermes, backend, Vite |
| `stop-local.sh` | Stop processes started by run-local (via `.logs/*.pid`) |
| `test_pipeline.py`, `peek_mongo.py` | Debugging / pipeline checks |

---

## Persistence (frontend)

Session data is stored under `localStorage` key `forseen.session.v1` with a **version** field inside JSON (currently v3). Migrations run in `frontend/src/lib/persisted-session.ts` when the version bumps. RAG history uses `forseen.rag.v1` separately.

---

## Related docs

- [`../backend/API.md`](../backend/API.md) — REST API
- [`../README.md`](../README.md) — repo entry point
