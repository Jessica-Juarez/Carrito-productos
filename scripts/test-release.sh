#!/usr/bin/env bash
set -euo pipefail

frontend_url="${FRONTEND_URL:-http://localhost:3000}"
backend_url="${BACKEND_URL:-http://localhost:5000}"

check_url() {
  local url="$1"
  local attempt

  for attempt in $(seq 1 30); do
    if curl --fail --silent --show-error "$url" >/dev/null; then
      printf 'OK %s\n' "$url"
      return 0
    fi
    sleep 2
  done

  printf 'No se pudo validar %s despues de 60 segundos.\n' "$url" >&2
  return 1
}

check_url "$frontend_url"
check_url "$backend_url/health"
