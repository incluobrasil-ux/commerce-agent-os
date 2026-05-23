#!/usr/bin/env bash
# clone-upstreams.sh — clona upstreams read-only em 01_upstreams/
# Política: ADR-0002. Cada upstream pinado a um SHA. Re-clone manual para atualizar.
# Uso: bash 10_ops/scripts/clone-upstreams.sh [<repo-name>]
#   sem argumento: clona todos.
#   com argumento: clona só o repo nomeado.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
UPSTREAMS_DIR="${REPO_ROOT}/01_upstreams"

# Formato: <name>|<url>|<pinned-sha>
UPSTREAMS=(
  "langgraph|https://github.com/langchain-ai/langgraph.git|d1e2ff0561a8b0b09212d0795c9d7b390a5de23a"
  "shopify-app-template-react-router|https://github.com/Shopify/shopify-app-template-react-router.git|5a0017b0dc26edc7b8eda239ceb2a1d6140210e2"
)

clone_one() {
  local name="$1"
  local url="$2"
  local sha="$3"
  local target="${UPSTREAMS_DIR}/${name}"

  if [ -d "${target}/.git" ]; then
    echo "[clone-upstreams] ${name}: já presente em ${target} — skip"
    return 0
  fi

  echo "[clone-upstreams] ${name}: clonando ${url} @ ${sha}"
  mkdir -p "${UPSTREAMS_DIR}"
  git clone --depth=1 "${url}" "${target}"
  (
    cd "${target}"
    # Pinar exatamente no SHA registrado quando possível
    git fetch --depth=1 origin "${sha}" 2>/dev/null || true
    git checkout "${sha}" 2>/dev/null || {
      echo "[clone-upstreams] ${name}: SHA ${sha} não disponível no shallow clone; mantendo HEAD"
    }
  )
  echo "[clone-upstreams] ${name}: ok ($(cd "${target}" && git rev-parse HEAD))"
}

requested="${1:-}"

for entry in "${UPSTREAMS[@]}"; do
  IFS='|' read -r name url sha <<< "${entry}"
  if [ -n "${requested}" ] && [ "${requested}" != "${name}" ]; then
    continue
  fi
  clone_one "${name}" "${url}" "${sha}"
done

if [ -n "${requested}" ]; then
  echo "[clone-upstreams] done (filtered: ${requested})"
else
  echo "[clone-upstreams] done — ${#UPSTREAMS[@]} upstream(s) processados"
fi

echo ""
echo "Próximo passo sugerido:"
echo "  pnpm audit:repo 01_upstreams/<name>     # auditar 1"
echo "  pnpm audit:repo 01_upstreams/<name> --profile=license  # só licença"
