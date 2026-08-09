#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

DEPLOY_HOST="${DEPLOY_HOST:-golf-vps}"
CADDYFILE_REMOTE="${CADDYFILE_REMOTE:-/etc/caddy/Caddyfile}"
REMOTE_ROOT="${REMOTE_ROOT:-/srv/shermandavison}"

npm run build

ssh "${DEPLOY_HOST}" "mkdir -p '${REMOTE_ROOT}' && cp -a '${CADDYFILE_REMOTE}' '${CADDYFILE_REMOTE}.bak.$(date +%Y%m%d%H%M%S)' || true"

rsync -az --delete "${SCRIPT_DIR}/dist/" "${DEPLOY_HOST}:${REMOTE_ROOT}/"
scp Caddyfile "${DEPLOY_HOST}:${CADDYFILE_REMOTE}"

ssh "${DEPLOY_HOST}" "caddy validate --config ${CADDYFILE_REMOTE} && (systemctl reload caddy || systemctl restart caddy)"

echo "Deployed → https://shermandavison.com"
