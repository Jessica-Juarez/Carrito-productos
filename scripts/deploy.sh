#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?Define DEPLOY_HOST}"
: "${DEPLOY_USER:?Define DEPLOY_USER}"
: "${DEPLOY_PATH:?Define DEPLOY_PATH}"
: "${IMAGE_TAG:?Define IMAGE_TAG}"
: "${GHCR_TOKEN:?Define GHCR_TOKEN}"
: "${GITHUB_ACTOR:?Define GITHUB_ACTOR}"

if [[ ! "$DEPLOY_PATH" =~ ^/[A-Za-z0-9._/-]+$ ]]; then
  printf 'DEPLOY_PATH debe ser una ruta absoluta sin espacios ni caracteres especiales.\n' >&2
  exit 1
fi

remote="${DEPLOY_USER}@${DEPLOY_HOST}"
ssh "$remote" "mkdir -p '$DEPLOY_PATH'"
scp docker-compose.deploy.yml scripts/deploy-remote.sh "$remote:$DEPLOY_PATH/"

printf '%s' "$GHCR_TOKEN" |
  ssh "$remote" "cd '$DEPLOY_PATH' && bash deploy-remote.sh '$IMAGE_TAG' '$GITHUB_ACTOR'"
