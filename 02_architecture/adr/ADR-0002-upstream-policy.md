# ADR-0002 — Política de upstreams

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —

## Contexto

O projeto referencia 20 repositórios externos. Eles cumprem três papéis distintos:
1. **Dependência prática** (consumo via SDK/lib oficial).
2. **Base operacional** (lógica adaptada para código autoral).
3. **Referência arquitetural** (estudo, sem cópia de código).

Sem política, isto pode degenerar em: forks acidentais, dependências cruzadas frágeis, código copiado sem licença/atribuição, ou drift entre o upstream e nossa cópia.

## Decisão

### 1. `01_upstreams/` é estritamente read-only

Nenhuma edição em arquivos de `01_upstreams/<repo>/`. Quaisquer ajustes vivem em:
- `06_packages/` (lib autoral inspirada/adaptada), ou
- `05_integrations/` (adapter para serviço externo).

### 2. Três métodos de ingestão

| Caso | Método | Exemplo |
|---|---|---|
| Dependência prática via SDK | dependência `package.json` pinada, **não clonar** | `posthog-node`, `@shopify/admin-api-client` |
| Base operacional (adaptamos código) | `git submodule` ou clone raso pinado a tag/SHA | `langgraph`, `shopify-app-template`, `higgsfield-skills` |
| Referência (somente estudo) | clone raso ou apenas link no audit | `gstack`, `dawn`, `caveman`, `feedx`, `adios`, `ECC` |

Default em dúvida: **referência** (mais conservador).

### 3. Atribuição e licença

- Toda cópia ou adaptação de código upstream para `06_packages/` ou `03_agents/` carrega no header:
  - upstream original (URL),
  - SHA/tag consultado,
  - licença do upstream,
  - resumo do que foi adaptado.
- Licenças incompatíveis com o projeto bloqueiam adoção.

### 4. Atualização

- Upstreams ingeridos como submodule têm versão pinada; atualização é PR explícito.
- Upstreams como referência podem ficar desatualizados — está OK, devem ser tratados como snapshot.

### 5. Auditoria de segurança

Antes de qualquer execução de código de upstream em ambiente de dev/CI, varredura básica:
- segredos hardcoded,
- `eval` / execução de string,
- dependências com CVEs conhecidas.

## Consequências

**Positivas**
- Atualização de upstreams é controlada.
- Adaptações ficam visíveis (commit em código autoral), não escondidas em forks.
- Reduz risco legal (licenças) e de segurança.

**Negativas**
- Overhead inicial para classificar cada upstream.
- Submodules têm DX inferior a npm deps (mitigado: usar SDK oficial onde existir).
