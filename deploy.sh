#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
scp "${SCRIPT_DIR}/index.html" golf-vps:/srv/ancc-blog/index.html
echo "Deployed → https://ancc.blog"
