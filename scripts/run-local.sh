#!/usr/bin/env bash
# Start Forseen locally: K2 (8001), Hermes (8002), backend (8000), Vite (5175).
# Prereqs: Python 3.11+, Node/npm, MongoDB on localhost:27017 (or we try Docker for Mongo only).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
VENV="$ROOT/.venv"
UVICORN="$VENV/bin/uvicorn"
LOGDIR="$ROOT/.logs"
mkdir -p "$LOGDIR"

free_port() {
  local p=$1
  local pids
  pids=$(lsof -ti tcp:"$p" -sTCP:LISTEN 2>/dev/null || true)
  if [[ -n "${pids}" ]]; then
    echo "Stopping process on port $p"
    kill ${pids} 2>/dev/null || true
    sleep 0.5
  fi
}

if [[ ! -x "$VENV/bin/python" ]]; then
  echo "Creating venv at $VENV"
  python3 -m venv "$VENV"
fi
# shellcheck source=/dev/null
source "$VENV/bin/activate"
pip install -q --upgrade pip
pip install -q -r "$ROOT/backend/requirements.txt"
pip install -q openai

# Optional: Mongo via Docker if Docker exists and nothing listens on 27017
if ! (echo >/dev/tcp/127.0.0.1/27017) 2>/dev/null; then
  if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
      if docker ps -a --format '{{.Names}}' | grep -q '^forseen-mongo$'; then
        docker start forseen-mongo >/dev/null 2>&1 || true
      else
        echo "Starting MongoDB container (forseen-mongo) on port 27017..."
        docker run -d --name forseen-mongo -p 27017:27017 mongo:7
      fi
    else
      echo "Warning: MongoDB not reachable on 27017. Start Mongo or run: docker run -d --name forseen-mongo -p 27017:27017 mongo:7"
    fi
  else
    echo "Warning: MongoDB not on 27017. Install/start MongoDB for analyze/RAG."
  fi
else
  echo "MongoDB already listening on 27017."
fi

for p in 8000 8001 8002 5175; do free_port "$p"; done

run_uvicorn() {
  local dir=$1 port=$2 name=$3
  (
    cd "$dir"
    set -a
    # shellcheck source=/dev/null
    [[ -f .env ]] && source .env
    set +a
    exec "$UVICORN" main:app --host 127.0.0.1 --port "$port"
  ) >"$LOGDIR/${name}.log" 2>&1 &
  echo $! >"$LOGDIR/${name}.pid"
  echo "Started $name (pid $(cat "$LOGDIR/${name}.pid")) — logs: $LOGDIR/${name}.log"
}

run_uvicorn "$ROOT/model_servers/k2" 8001 k2
run_uvicorn "$ROOT/model_servers/hermes" 8002 hermes
run_uvicorn "$ROOT/backend" 8000 backend

(
  cd "$ROOT/frontend"
  exec npm run dev -- --host 127.0.0.1 --port 5175
) >"$LOGDIR/frontend.log" 2>&1 &
echo $! >"$LOGDIR/frontend.pid"
echo "Started frontend (pid $(cat "$LOGDIR/frontend.pid")) — logs: $LOGDIR/frontend.log"

sleep 1
echo ""
echo "URLs:"
echo "  UI:       http://127.0.0.1:5175/"
echo "  API:      http://127.0.0.1:8000/health"
echo "  K2:       http://127.0.0.1:8001/health"
echo "  Hermes:   http://127.0.0.1:8002/health"
echo ""
echo "Stop with: $ROOT/scripts/stop-local.sh"
