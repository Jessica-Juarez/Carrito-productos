#!/usr/bin/env bash
set -euo pipefail

image_tag="${1:?Falta el tag de la imagen}"
ghcr_user="${2:?Falta el usuario de GitHub}"

if [[ ! "$image_tag" =~ ^[A-Za-z0-9._-]+$ || ! "$ghcr_user" =~ ^[A-Za-z0-9-]+$ ]]; then
  printf 'El tag o el usuario de GitHub tiene caracteres no permitidos.\n' >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  printf 'Falta %s/.env; configura primero las variables de produccion en el servidor.\n' "$PWD" >&2
  exit 1
fi

export IMAGE_TAG="$image_tag"
docker login ghcr.io --username "$ghcr_user" --password-stdin
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

docker compose --env-file .env -f docker-compose.deploy.yml pull
docker compose --env-file .env -f docker-compose.deploy.yml up -d --no-build --remove-orphans --wait --wait-timeout 180
