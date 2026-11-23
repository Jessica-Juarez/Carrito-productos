#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.release.yml"

if [[ -f .env.release ]]; then
  docker compose --env-file .env.release -f "$compose_file" up -d --build --wait --wait-timeout 180
else
  docker compose -f "$compose_file" up -d --build --wait --wait-timeout 180
fi
