# Forseen

**AI-powered compliance intelligence — anticipate regulatory change before it hits.**

Forseen transforms a company profile into actionable regulatory insights. Complete a guided onboarding wizard, enter a compliance topic like “health data privacy,” and get live risk predictions, structured compliance reports, and interactive visualizations — all grounded in real regulatory signals from nine federal, state, and third-party sources. A RAG-powered chat interface lets you ask follow-up questions against your analysis and the retrieved documents.

---

## Features

- **Guided company setup** — Multi-step profile wizard capturing industry, legal structure, data practices, operating states, and compliance posture with validation and persisted sessions
- **Topic decomposition** — Broad compliance questions are broken into specific regulatory sub-topics by K2 for targeted analysis
- **Parallel predictions** — K2 generates scored risk predictions (6-month, 12-month, 24-month probabilities) for each sub-topic concurrently
- **Structured reports** — Hermes produces plain-English compliance reports with executive summaries, priority actions, and section breakdowns
- **Interactive dashboard** — Risk radar, signal network graph, probability timelines, prediction cards, and drill-down modals
- **Vector-backed retrieval** — MongoDB Atlas vector search over signal embeddings for semantic matching
- **RAG chat** — Conversational follow-ups grounded in your analysis context and retrieved regulatory documents
- **Nine regulatory sources** — Federal Register, Congress.gov, FTC, FDA, CMS, ONC, NIST, CISA, state legislatures, Reddit, Google News, and NewsAPI
- **Session persistence** — Company profiles and analysis results persist across browser sessions via localStorage
- **One-command local dev** — Single script spins up all services including auto-starting MongoDB via Docker

---

## Architecture

```
frontend/          React 19 + TypeScript + Vite (port 5175)
backend/           FastAPI orchestration API (port 8000)
model_servers/k2/  K2 Think v2 — topic decomposition & predictions (port 8001)
model_servers/hermes/  Hermes 4.3 — report & narrative generation (port 8002)
data_ingestion/    Signal pipelines: ingestors, embeddings, dedup, entity extraction, scoring
scripts/           Local dev scripts (run, stop, inspect)
```
---
<img width="11583" height="9728" alt="pipeline" src="https://github.com/user-attachments/assets/ff35d197-2f2b-409e-a584-c8e65aaf41d2" />

### Analysis flow

1. **Profile** — Complete the setup wizard (identity, scale, data practices, operating states, certifications)
2. **Topic input** — Enter a regulatory topic and jurisdiction
3. **Signal fetch** — Backend queries MongoDB with vector search for relevant regulatory signals
4. **Decompose** — K2 breaks the topic into 3-5 specific sub-topics
5. **Predict** — K2 runs parallel predictions across sub-topics with probability scores, reasoning, and counterfactors
6. **Report** — Hermes generates a structured compliance report from all predictions
7. **Explore** — Dashboard visualizations, drill-downs, and RAG chat for deeper questions

---

## Built With

### AI & Model Servers

- **[K2 Think v2](https://k2think.ai)** — Regulatory prediction and topic decomposition (OpenAI-compatible API)
- **[Hermes 4.3-36B](https://nousresearch.com)** — Structured report and narrative generation (OpenAI-compatible API)

### Backend

- **FastAPI** — Orchestration API (`/analyze`, `/predictions`, `/reports`, `/chat`)
- **Python 3.11+**, **Uvicorn**, **Pydantic 2.0**
- **Motor** (async MongoDB driver) + **MongoDB Atlas** vector search
- **httpx** — Async HTTP for model server communication

### Frontend

- **React 19** + **TypeScript 5.9** — Setup wizard, analysis UI, dashboard
- **Vite 8** — Dev server and production builds
- **Tailwind CSS v4** — Theming and layout
- **Radix UI** — Accessible component primitives
- **Framer Motion** — Animations and transitions
- **Recharts** — Data visualizations (radar, timelines, gauges)
- **Sonner** — Toast notifications

### Data Ingestion

Nine ingestors feeding MongoDB with regulatory signals:

| Source | Description |
|--------|-------------|
| Federal Register | Rules, notices, proposed regulations |
| Congress.gov | Bills and legislation |
| FTC | Enforcement actions and guidance |
| FDA, CMS, ONC, NIST, CISA | Federal agency regulatory updates |
| State legislatures | All 50 states via LegiScan |
| Reddit | Compliance and regulatory subreddit discussions |
| Google News | Google News alerts |
| NewsAPI | News articles on regulatory topics |

Pipeline stages: deduplication, entity extraction, summary enrichment, relevance scoring, signal velocity computation, and vector embedding generation.

---

## Quick Start

### Local (one script)

```bash
git clone https://github.com/<your-org>/YHack-2026.git
cd YHack-2026
./scripts/run-local.sh
```

This creates a Python venv, installs dependencies, and starts all four services. If Docker is available and MongoDB isn't running, it auto-starts a `mongo:7` container.

| Service | URL |
|---------|-----|
| Frontend | http://127.0.0.1:5175 |
| API docs | http://127.0.0.1:8000/docs |
| K2 | http://127.0.0.1:8001 |
| Hermes | http://127.0.0.1:8002 |

Logs and PID files live under `.logs/`. Stop everything with:

```bash
./scripts/stop-local.sh
```

### Docker Compose

```bash
docker compose up --build
```

Starts K2, Hermes, and the backend. Frontend runs separately via `cd frontend && npm run dev`.

### Manual setup

```bash
# Backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install && cd ..
```

### Environment

Copy `.env.example` files and fill in your keys:

| File | Variables |
|------|-----------|
| `backend/.env` | `MONGO_URI`, `MONGO_DB`, `K2_BASE_URL`, `HERMES_BASE_URL` |
| `model_servers/k2/.env` | `K2_API_KEY`, `K2_BASE_URL`, `K2_MODEL` |
| `model_servers/hermes/.env` | `HERMES_API_KEY`, `HERMES_BASE_URL_MODEL`, `HERMES_MODEL` |
| `frontend/.env` | `VITE_API_BASE_URL` (defaults to `http://localhost:8000`) |

---

## API

Full reference: **[backend/API.md](backend/API.md)**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/analyze/` | POST | Full pipeline: signals + decomposition + predictions + report |
| `/predictions/` | POST | Direct K2 prediction (no signal fetch) |
| `/reports/` | POST | Direct Hermes report from prediction IDs |
| `/chat/` | POST | RAG chat with signal and prediction context |

**Example:**

```bash
curl -s -X POST http://127.0.0.1:8000/analyze/ \
  -H “Content-Type: application/json” \
  -d '{
    “topic”: “health data privacy”,
    “jurisdiction”: “CA”,
    “company”: {
      “name”: “Acme Health”,
      “legal_structure”: “C-Corp”,
      “industry”: “Healthcare SaaS”,
      “size”: 45,
      “location”: “San Francisco, CA”,
      “operating_states”: [“CA”, “NY”],
      “description”: “B2B clinical decision support”,
      “handles_pii”: true,
      “handles_phi”: true,
      “uses_ai_ml”: true,
      “b2b”: true,
      “certifications”: [“HIPAA”]
    }
  }'
```

---

## Acknowledgments

Built at **YHack 2026**. Thanks to the organizers, mentors, and sponsors.

---

## Future Roadmap

- [ ] International regulatory sources (EU, UK)
- [ ] Real-time monitoring and alerts for new regulations
- [ ] Historical trend analysis for regulatory pressure
- [ ] Collaborative features for compliance teams
- [ ] GRC platform integrations
- [ ] Domain-specific model fine-tuning
- [ ] Auth and multi-tenant company profiles
- [ ] CI pipeline (lint, typecheck, tests)

---
