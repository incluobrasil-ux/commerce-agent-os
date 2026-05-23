# Índice de upstreams

Repositórios externos previamente estudados. Read-only em `01_upstreams/`.

> Classificação completa (papel, prioridade, risco) em [REPO_SELECTION.md](./REPO_SELECTION.md). Audits detalhados em [../02_architecture/repo-audits/](../02_architecture/repo-audits/).

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
