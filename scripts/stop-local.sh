#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGDIR="$ROOT/.logs"

for p in 8000 8001 8002 5175; do
  pids=$(lsof -ti tcp:"$p" -sTCP:LISTEN 2>/dev/null || true)
  if [[ -n "${pids}" ]]; then
    echo "Killing port $p: $pids"
    kill ${pids} 2>/dev/null || true
  fi
done

if [[ -d "$LOGDIR" ]]; then
  for f in "$LOGDIR"/*.pid; do
    [[ -f "$f" ]] || continue
    pid=$(cat "$f" 2>/dev/null || true)
    if [[ -n "${pid}" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "Killing pid $pid from $f"
      kill "$pid" 2>/dev/null || true
    fi
  done
fi

echo "Stopped local services."
