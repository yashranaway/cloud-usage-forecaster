#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if [ -d .venv ]; then
  . .venv/bin/activate
fi

exec python src/main.py

