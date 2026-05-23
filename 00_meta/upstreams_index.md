# Índice de upstreams

Repositórios externos previamente estudados. Read-only em `01_upstreams/`. Conteúdo **não** entra no monorepo — cada operador clona via `bash 10_ops/scripts/clone-upstreams.sh`.

> Classificação completa (papel, prioridade, risco) em [REPO_SELECTION.md](./REPO_SELECTION.md). Audits detalhados em [../02_architecture/repo-audits/](../02_architecture/repo-audits/). Auditorias automáticas (via `pnpm audit:repo`): [`../12_reports/audits/repo-auditor/`](../12_reports/audits/repo-auditor/).

## Clonados localmente (com licença confirmada via `repo-auditor`)

**Sub-fase 2.3 concluída** — 10 upstreams prioritários auditados. Relatórios em [`../12_reports/audits/upstream-pass2/`](../12_reports/audits/upstream-pass2/).

| # | Nome | Pin SHA | Licença | Findings | Notas |
|---|---|---|---|---|---|
| 1 | `langgraph` | `d1e2ff05` | MIT | 0 | runtime ref (Python + libs/langgraph-js/) |
| 8 | `dawn` | `9ccdacf8` | MIT | 0 | Shopify theme ref |
| 9 | `shopify-app-template-react-router` | `5a0017b0` | MIT | 0 | base do admin app |
| 10 | `merchant-api-samples` | `371468ac` | Apache-2.0 | 0 | integração GMC |
| 11 | `feedgen` | `cf264a5f` | Apache-2.0 | 0 | feed Python (ADR-0011 pendente) |
| 7 | `basic-memory` | `a7e2368f` | **AGPL-3.0** | 0 | ⚠ copyleft forte — só ref conceitual |
| 5 | `agentshield` | `25d91f00` | MIT | 0 | base de `@cao/guardrails` |
| 17 | `ad-factory-agent` | `8596feeb` | **UNKNOWN** | 1🔴 | ⚠ sem LICENSE — só estudo, não copiar |
| 19 | `higgsfield-skills` | `5af02582` | MIT | 0 | skills genéricas |
| 20 | `higgsfield-cli` | `46cc997c` | MIT | 0 | CLI de skills |

Outros 10 upstreams (do catálogo de 20) ainda não clonados — adicionar ao script `10_ops/scripts/clone-upstreams.sh` quando suas sub-fases chegarem.

## Catálogo de referência (20 upstreams classificados)

| # | Repositório | Categoria | Uso esperado |
|---|---|---|---|
| 1 | langchain-ai/langgraph | Agent runtime | Base para orquestração de agentes |
| 2 | affaan-m/ECC | E-commerce | Referência de domínio |
| 3 | garrytan/gstack | Stack template | Referência de stack |
| 4 | JuliusBrussee/caveman | Agent framework | Referência |
| 5 | affaan-m/agentshield | Agent safety | Guardrails |
| 6 | adamtylerlynch/obsidian-agent-memory-skills | Memory | Skills de memória |
| 7 | basicmachines-co/basic-memory | Memory | Memória persistente |
| 8 | Shopify/dawn | Shopify theme | Referência de tema |
| 9 | Shopify/shopify-app-template-react-router | Shopify app | Base do app embedded |
| 10 | google/merchant-api-samples | Merchant API | Integração com feeds Google |
| 11 | google-marketing-solutions/feedgen | Feed | Geração de feeds |
| 12 | google-marketing-solutions/feedx | Feed | Experimentação de feeds |
| 13 | google-marketing-solutions/adios | Ads | Imagens de anúncios |
| 14 | FlatNineOrg/ecommerce-skills | Skills | Skills de e-commerce |
| 15 | brightdata/competitive-intelligence | Intelligence | Coleta competitiva |
| 16 | coreyhaines31/marketingskills | Skills | Skills de marketing |
| 17 | agency-ai-solutions/ad-factory-agent | Ads agent | Geração de anúncios |
| 18 | PostHog/posthog | Analytics | Telemetria de produto |
| 19 | higgsfield-ai/skills | Skills | Skills genéricas |
| 20 | higgsfield-ai/cli | CLI | CLI de skills |

## Convenções de uso

- Cada upstream tem uma subpasta em `01_upstreams/<nome>/`.
- Auditorias e extratos vão para `12_reports/audits/<nome>.md`.
- Quando relevante, adaptações autorais ficam em `06_packages/` ou `05_integrations/`, nunca dentro de `01_upstreams/`.
