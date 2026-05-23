#!/usr/bin/env bash
# validate-structure.sh — confirma que a árvore do monorepo bate com a esperada.
# Status: placeholder. A popular na Fase 5 com checks reais.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

REQUIRED_DIRS=(
  "00_meta"
  "01_upstreams"
  "02_architecture"
  "03_agents"
  "04_apps"
  "05_integrations"
  "06_packages"
  "07_memory"
  "08_data"
  "09_prompts"
  "10_ops"
  "11_tests"
  "12_reports"
)

REQUIRED_META_FILES=(
  "00_meta/PROJECT_SCOPE.md"
  "00_meta/SUCCESS_CRITERIA.md"
  "00_meta/ROADMAP.md"
  "00_meta/DECISIONS.md"
  "00_meta/STACK_RULES.md"
  "00_meta/REPO_SELECTION.md"
)

fail=0

for d in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$ROOT/$d" ]; then
    echo "[FAIL] dir missing: $d"
    fail=1
  fi
done

for f in "${REQUIRED_META_FILES[@]}"; do
  if [ ! -f "$ROOT/$f" ]; then
    echo "[FAIL] file missing: $f"
    fail=1
  fi
done

if [ $fail -eq 0 ]; then
  echo "[OK] structure looks good"
fi

exit $fail
