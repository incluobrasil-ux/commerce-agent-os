#!/usr/bin/env bash
# bootstrap.sh — pipeline local de validação.
# Status: placeholder. Implementação real na Fase 5.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$DIR"

echo "[bootstrap] step 1/4 — check-env"
bash 10_ops/scripts/check-env.sh

echo "[bootstrap] step 2/4 — validate-structure"
bash 10_ops/scripts/validate-structure.sh

echo "[bootstrap] step 3/4 — pnpm install"
echo "  (skipped — deps ainda não definidas; ativar na Fase 5)"
# pnpm install

echo "[bootstrap] step 4/4 — typecheck + smoke"
echo "  (skipped — typecheck/smoke a habilitar na Fase 5)"
# pnpm typecheck
# pnpm test:smoke

echo "[bootstrap] done"
