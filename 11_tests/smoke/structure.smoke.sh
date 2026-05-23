#!/usr/bin/env bash
# structure.smoke.sh — smoke test que delega para validate-structure.sh.
# Roda standalone sem dependências.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec bash "$DIR/10_ops/scripts/validate-structure.sh"
