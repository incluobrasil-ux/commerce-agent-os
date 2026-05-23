# Repo selection — classificação mestra

Auditoria dos 20 repositórios previamente estudados. Datado 2026-05-23.

**Status atual:** nenhum repositório foi clonado localmente em `01_upstreams/`. Todas as classificações abaixo são baseadas em conhecimento público estável e devem ser **verificadas ao clonar**. Itens em dúvida estão marcados com `⚠ verificar`.

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

Pendência operacional: definir mecanismo de ingestão para `01_upstreams/`.
- Opção A: `git submodule` — atualizações controladas, requer git init local.
- Opção B: `git subtree` — histórico inline, mais simples para colaboradores.
- Opção C: clone raso sem rastreio (read-only verdadeiro).

Recomendação preliminar: **opção C para referências, opção A para upstreams de base operacional** (#1, #8, #9, #19). Aguardando decisão.

## Pendências

- Verificar in-loco os 6 repos marcados `⚠ verificar` ao clonar.
- Confirmar licenças (especialmente #14, #16, #17).
- Confirmar se PostHog será SaaS (cloud) ou self-hosted — afeta #18.
- Decidir se feedgen (#11) será portado para TS ou consumido via subprocesso Python.
