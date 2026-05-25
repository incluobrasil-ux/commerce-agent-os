# Repo selection — classificação mestra

Auditoria dos 20 repositórios previamente estudados. Datado 2026-05-23.

**Status atual (atualizado 2026-05-23):** Sub-fase 2.3 **concluída** — **10 dos 20 upstreams clonados** em `01_upstreams/` (gitignored, cada operador roda `bash 10_ops/scripts/clone-upstreams.sh`) e auditados via `pnpm audit:repo`. Resultados consolidados na seção "Audit pass 2" abaixo. Outros 10 (#2, #3, #4, #6, #12–#16, #18) seguem sem clone até suas sub-fases chegarem.

## Legenda

- **Papel**
  - `upstream` — copiado verbatim em `01_upstreams/<repo>/`, read-only.
  - `referência` — estudado em `01_upstreams/`, padrões informam design, sem cópia de código.
  - `base operacional` — funções/módulos adaptados em `06_packages/` ou `05_integrations/` (upstream permanece read-only; adaptações vivem fora).
  - `integração` — serviço externo consumido por adaptador em `05_integrations/`.
- **Prioridade** — `alta` (Fase 1–2), `média` (Fase 3–5), `baixa` (Fase 6+).

## Tabela de classificação

| # | Repositório | Objetivo | Papel | Categoria | Prioridade | Risco |
|---|---|---|---|---|---|---|
| 1 | langchain-ai/langgraph | Orquestração de agentes (graph runtime) | upstream + base operacional | 06_packages (runtime) | **alta** | versionamento rápido; surface API ainda evolui |
| 2 | affaan-m/ECC | E-commerce copy/content ⚠ verificar | referência | 03_agents (inspiração) | baixa | repo pessoal, manutenção incerta |
| 3 | garrytan/gstack | Starter stack (YC) ⚠ verificar | referência | 04_apps (inspiração) | baixa | snapshot opinativo |
| 4 | JuliusBrussee/caveman | Framework de agente experimental ⚠ verificar | referência | 03_agents (inspiração) | baixa | repo pessoal; pode ser PoC |
| 5 | affaan-m/agentshield | Guardrails/safety para agentes ⚠ verificar | base operacional | 06_packages/guardrails | média | repo pessoal; auditar antes de adotar |
| 6 | adamtylerlynch/obsidian-agent-memory-skills | Skills de memória estilo Obsidian | referência | 07_memory (padrões) | média | pode acoplar a Obsidian; abstrair |
| 7 | basicmachines-co/basic-memory | Memória markdown-first persistente | base operacional | 07_memory + 06_packages/memory | **alta** | depende de filesystem local |
| 8 | Shopify/dawn | Tema de referência Shopify | upstream | 01_upstreams/dawn (referência de tema) | **alta** | tema é Liquid, não TS — apenas referência visual/HTML |
| 9 | Shopify/shopify-app-template-react-router | Template oficial de app embedded | upstream + base operacional | 04_apps/shopify-app | **alta** | precisa Shopify Partners + chaves API |
| 10 | google/merchant-api-samples | Exemplos da Merchant API (gMC) | referência + integração | 05_integrations/google-merchant | **alta** | OAuth + Merchant Center setup |
| 11 | google-marketing-solutions/feedgen | Geração de feeds com LLM | base operacional | 05_integrations/google-merchant + 03_agents/feed | **alta** | Python; pode exigir port ou bridge |
| 12 | google-marketing-solutions/feedx | Experimentação de feeds (A/B) | referência | 02_architecture (padrão de experimentação) | média | Python; experimentação avançada |
| 13 | google-marketing-solutions/adios | Imagens para Google Ads | referência | 05_integrations/google-ads (futuro) | baixa | escopo de ads, depende de Ads API |
| 14 | FlatNineOrg/ecommerce-skills | Biblioteca de skills de e-commerce ⚠ verificar | base operacional | 06_packages/skills-ecommerce | média | repo de organização; verificar licença |
| 15 | brightdata/competitive-intelligence | Coleta competitiva via Bright Data | integração | 05_integrations/brightdata | média | serviço pago; cuidados legais (ToS de scraping) |
| 16 | coreyhaines31/marketingskills | Biblioteca de skills de marketing ⚠ verificar | base operacional | 06_packages/skills-marketing | média | repo pessoal; verificar conteúdo |
| 17 | agency-ai-solutions/ad-factory-agent | Agente de geração de criativos de anúncio | base operacional | 03_agents/ad-factory | **alta** | depende de provedores de imagem/vídeo |
| 18 | PostHog/posthog | Analytics de produto | integração | 05_integrations/posthog | **alta** | usar SDK + cloud; não embarcar o monorepo do PostHog |
| 19 | higgsfield-ai/skills | Skills da Higgsfield | upstream + base operacional | 06_packages/skills + 03_agents | **alta** | verificar formato de skill e runtime |
| 20 | higgsfield-ai/cli | CLI da Higgsfield | base operacional | 10_ops/higgsfield-cli | **alta** | CLI externa — embrulhar, não duplicar |

## Resumo por categoria

- **upstream + base operacional (clone + adaptação):** #1, #9, #19
- **upstream puro (clone read-only):** #8
- **base operacional (adaptar funções):** #5, #7, #11, #14, #16, #17, #20
- **referência arquitetural (estudar, não copiar):** #2, #3, #4, #6, #12, #13
- **integração (SDK/HTTP):** #10, #15, #18

## Decisão sobre clones

**Resolvida 2026-05-23:** **Opção C (clone raso) para todos**, gitignored, com SHA pinado em `10_ops/scripts/clone-upstreams.sh`. Atualização = editar SHA + re-clonar manualmente. ADR-0002 cobre.

## Audit pass 2 — resultados (Sub-fase 2.3)

Relatórios reais em [`../12_reports/audits/upstream-pass2/`](../12_reports/audits/upstream-pass2/). Tamanho do clone raso entre parênteses.

| # | Repositório | Pin SHA | Licença | Findings | Observação pós-audit |
|---|---|---|---|---|---|
| 1 | langchain-ai/langgraph (17M) | `d1e2ff05` | MIT ✅ | 0 | Python primário; TS em `libs/langgraph-js/`. Bom como referência de design (ADR-0007). |
| 5 | affaan-m/agentshield (5.3M) | `25d91f00` | MIT ✅ | 0 | Confirmada licença. Adotar como base de `@cao/guardrails`. Flag `⚠ verificar` resolvida. |
| 7 | basicmachines-co/basic-memory (12M) | `a7e2368f` | **AGPL-3.0** ⚠ | 0 | **Copyleft forte.** Seguro como referência conceitual; **NÃO importar código** sem deliberação (releases derivados precisariam ser AGPL). Reclassificar de "base operacional" para "**referência**". |
| 8 | Shopify/dawn (6.2M) | `9ccdacf8` | MIT ✅ | 0 | OK como referência de tema. |
| 9 | Shopify/shopify-app-template-react-router (323K) | `5a0017b0` | MIT ✅ | 0 | Confirmada base para Sub-fase 2.6. |
| 10 | google/merchant-api-samples (4.7M) | `371468ac` | Apache-2.0 ✅ | 0 | OK; license confirmada. |
| 11 | google-marketing-solutions/feedgen (4.4M) | `cf264a5f` | Apache-2.0 ✅ | 0 | Python. ADR-0011 (sidecar vs port) ainda pendente. |
| 17 | agency-ai-solutions/ad-factory-agent (1.3M) | `8596feeb` | **UNKNOWN** 🔴 | 1 crítico | **Sem LICENSE file** → "all rights reserved" por default. **Reclassificar para "referência apenas — não copiar"**. Reabrir #17 com o autor antes de adotar como base operacional. |
| 19 | higgsfield-ai/skills (585K) | `5af02582` | MIT ✅ | 0 | Confirmado. |
| 20 | higgsfield-ai/cli (514K) | `46cc997c` | MIT ✅ | 0 (1 warning: sem .gitignore — só afeta o próprio repo deles) |

## Pendências (atualizado pós-Sub-fase 2.3)

- ✅ **Resolvidas:** licenças de #5, #7, #9, #10, #11, #19, #20 confirmadas. ⚠ verificar removido onde aplicável.
- 🔴 **Pendente decisão:** reclassificação de #7 (AGPL — "referência" em vez de "base operacional") e #17 (UNKNOWN — "referência apenas"). Tratar como mudança de roadmap; precisa de ADR se mudar plano de adoção.
- 🟡 Confirmar PostHog SaaS vs self-hosted — afeta #18 (ainda não clonado).
- 🟡 ADR-0011: estratégia para `feedgen` (#11) Python — sidecar vs port TS.
- ⚪ Audit de #14, #16 quando entrarem em alguma sub-fase (ainda baixa prioridade).
