#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

DEPLOY_HOST="${DEPLOY_HOST:-golf-vps}"
CADDYFILE_REMOTE="${CADDYFILE_REMOTE:-/etc/caddy/Caddyfile}"

npm run build
scp -r dist/* "${DEPLOY_HOST}:/srv/ancc-blog/"
scp Caddyfile "${DEPLOY_HOST}:${CADDYFILE_REMOTE}"

ssh "${DEPLOY_HOST}" "caddy validate --config ${CADDYFILE_REMOTE} && (systemctl reload caddy || systemctl restart caddy)"

echo "Deployed → https://ancc.blog"
