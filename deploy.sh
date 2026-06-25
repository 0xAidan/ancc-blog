#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

npm run build
scp -r dist/* golf-vps:/srv/ancc-blog/
echo "Deployed → https://ancc.blog"
