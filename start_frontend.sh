#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

# Load .env if present
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

exec bun run index.ts

