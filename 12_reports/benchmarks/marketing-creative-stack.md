# Marketing × Creative stack — benchmark dos upstreams

Comparativo dos 6 upstreams estudados que alimentam a camada de inteligência comercial, marketing e criativo. Datado 2026-05-23.

> Nenhum upstream clonado em `01_upstreams/` ainda — comparativo baseado em conhecimento público estável + audits da Fase 1. Revisar após Fase 6.

## Os 6 upstreams desta camada

1. `FlatNineOrg/ecommerce-skills`
2. `brightdata/competitive-intelligence`
3. `coreyhaines31/marketingskills`
4. `agency-ai-solutions/ad-factory-agent`
5. `higgsfield-ai/skills`
6. `higgsfield-ai/cli`

## Resumo: o que cada um traz, e onde entra

| Upstream | Eixo | Forma | Localização autoral | Status |
|---|---|---|---|---|
| `ecommerce-skills` | catálogo de skills de e-commerce (copy, atributos, pricing, merchandising) | biblioteca de skills | `@cao/skills/ecommerce/` (cherry-pick) | base operacional |
| `competitive-intelligence` | dataset + scrape SaaS (Bright Data) | integração paga | `05_integrations/brightdata/` (dependência) | integração |
| `marketingskills` | catálogo de skills de marketing (ICP, positioning, copy direction) | biblioteca de skills | `@cao/skills/marketing/` (cherry-pick) | base operacional |
| `ad-factory-agent` | padrão "factory" de geração de criativo de ad | inspiração arquitetural | `creative-ops-service` (estrutura, não código) | inspiração |
| `higgsfield-skills` | catálogo amplo de skills (multi-domínio) | biblioteca de skills runtime | `@cao/skills` via `05_integrations/higgsfield` | base operacional |
| `higgsfield-cli` | ferramenta para gerenciar skills da Higgsfield | dev/ops tooling | `10_ops/higgsfield-cli/` (wrappers) | dev tool |

## Mapeamento detalhado por agente

| Agente | Upstreams que apoiam | Modo |
|---|---|---|
| `market-intelligence` | brightdata/competitive-intelligence | dependência (datasets + SERP) |
|  | ecommerce-skills, marketingskills | inspiração de prompts/framing |
| `competitor-benchmark` | brightdata/competitive-intelligence | dependência direta |
| `product-offer` | ecommerce-skills | heurísticas (pricing, merchandising) |
|  | marketingskills | positioning framing |
| `marketing-director` | marketingskills | templates de plano por objetivo |
|  | ecommerce-skills | cross-references com merchandising |
|  | ad-factory-agent | inspira estrutura de `creative_brief` |
| `creative-copy-assets` | ad-factory-agent | **inspira pipeline brief→generate→validate→store** (sem fork) |
|  | higgsfield-skills | skills de copy (cherry-pick em `@cao/skills/copy/`) |
|  | marketingskills, ecommerce-skills | skills adicionais |

## Por que ad-factory-agent é inspiração, não dependência

`agency-ai-solutions/ad-factory-agent` resolve um problema próximo ao nosso (gerar criativos em escala) mas:

- Tem stack/runtime próprio — incorporá-lo forçaria adotar opiniões deles em runtime/cost/observability.
- Estrutura conceitual é **valiosa** mas portável: brief → generate → validate → store.
- Replicamos o padrão em `creative-ops-service` (pipelines + workers + providers) sem cópia de código.

O que extraímos:
1. **Separação fábrica/cognição:** decisões de "o que criar" ficam em `creative-copy-assets` (agente); execução em massa fica no `creative-ops-service`.
2. **Pipeline determinístico:** cada step (load brief, generate, validate, store) é isolado e instrumentado.
3. **Provenance por asset:** rastreabilidade obrigatória do prompt + modelo + custo.
4. **Variantes parametrizadas:** `outputs_required[]` cobre matriz canal × formato × locale.

O que **não** copiamos:
- Implementação concreta de providers (deles para deles).
- UI/CLI de operação.
- Estrutura de tabelas / schemas internos.

## Higgsfield como hub de skills

Higgsfield aparece **2 vezes** (skills + CLI) porque cobre duas funções distintas:

- **Skills (runtime):** durante uma run de agente, podemos invocar uma skill da Higgsfield como tool. Encapsulado em `05_integrations/higgsfield/client/`.
- **CLI (dev/ops):** wrapper shell em `10_ops/higgsfield-cli/` para descobrir/instalar skills durante desenvolvimento. **Não roda em produção.**

Política: cherry-pick em `05_integrations/higgsfield/skills-catalog.yaml`. Importar em bloco é proibido (ADR-0002, ADR-0003).

## Como ecommerce-skills / marketingskills / competitive-intelligence reforçam o eixo pesquisa → direção

```
[brightdata/competitive-intelligence]
   provê dados externos crus (SERP, dataset, scrape)
              │
              ▼
[market-intelligence + competitor-benchmark]
   transformam crus em sinais estruturados
              │
              ▼ contexto (07_memory/<tenant>/working/market/)
[ecommerce-skills]            [marketingskills]
   heurísticas de               framing de ICP +
   merchandising +              positioning +
   atributos                    copy direction
   (via @cao/skills/ecommerce)  (via @cao/skills/marketing)
              │                          │
              └───────────┬──────────────┘
                          ▼
            [product-offer + marketing-director]
                          │
                          ▼
                  [creative-copy-assets]
                  consome creative_brief
                          │
                          ▼ (matriz variantes)
                  [creative-ops-service]
```

Sem `competitive-intelligence`, os agentes de Tier 1 ficam apoiados só em sinais internos (limitado para tenants novos).
Sem `ecommerce-skills` + `marketingskills`, `product-offer` e `marketing-director` reinventam heurísticas que já estão estabilizadas no upstream.

## Riscos do uso

| Risco | Mitigação |
|---|---|
| Skills upstream mudam contrato | pin de versão; abstração via `@cao/skills` isola agentes |
| Bright Data custo escala mal | uso parcimonioso; jobs com budget tracking |
| Repos pessoais (FlatNine, coreyhaines) podem morrer | cherry-pick para `@cao/skills/*` desacopla |
| ad-factory-agent atualiza padrões | só inspiração — não somos forçados a acompanhar |
| Higgsfield muda formato | mesma estratégia: pin + isolar via adapter |

## Decisões em aberto

- [ ] Quais skills concretas (de cada catálogo) implementar/proxy primeiro — depende de quais agentes ativar primeiro.
- [ ] Hierarquia: local-first vs Higgsfield-first ao resolver skill em `@cao/skills`.
- [ ] Política de budget por skill (default + override por agente).
- [ ] Bright Data: começar com qual produto (Dataset / SERP / Web Unlocker)?

## Próxima ação

Após Fase 6 (clones em `01_upstreams/`), atualizar este benchmark com:
1. Schemas reais de manifest.
2. Lista de skills disponíveis em cada upstream.
3. Mapeamento explícito skill-do-upstream → `@cao/skills/<path>`.
