# Commands

Comandos principais. Tudo via `pnpm` na raiz. Atualizado: 2026-05-27.

## `pnpm chief` — entrypoint do Chefe

```bash
pnpm chief --tenant=<id> [--store=<id>] --objective="<descrição NL>" [opts]
```

Recebe objetivo em linguagem natural, classifica intent (`audit | catalog_merchant | offer | marketing | creative | design_ux | governance | cross_store | writeback | general`), seleciona um **playbook oficial** do registry, monta a rota efetiva (filtra steps por credenciais disponíveis), avalia camada jurídica (BR/EU/US) se houver `--legal-profile`, e devolve o plano.

| Flag | Significado |
|---|---|
| `--objective="..."` | Objetivo em NL (obrigatório). |
| `--tenant=<id>` | Tenant id (obrigatório). |
| `--store=<id>` | Store id (opcional, exigido para `--mode=writeback`). |
| `--mode=<read-only\|dry-run\|writeback>` | Modo de execução. Default vem do playbook. Writeback sem token/store rebaixa p/ dry-run automaticamente. |
| `--playbook=<id>` | Override do playbook auto-selecionado. Lista: `merchant-audit`, `offer-improvement`, `marketing-creative-chain`, `pdp-ux-review`, `governance-review`, `store-readiness`, `cross-store-diagnostic`, `safe-shopify-writeback`. |
| `--jurisdictions=<BR,EU,US-CA,US-FED>` | Jurisdições da operação. Default `BR`. |
| `--legal-profile=<path>` | Path JSON do `StoreLegalProfile` (override do auto-load). Auto-load tenta `07_memory/vault/tenants/<t>/stores/<s>/legal-profile.json` → `tenants/<t>/legal-profile.json` → null. Template em `07_memory/vault/templates/legal-profile.example.json`. |
| `--execute` | Despacha steps via shell (`pnpm <agent-command> --tenant --store`). Sem ela, default é plan-only. |
| `--resume=<runId>` | Continua run interrompido (a partir do checkpoint salvo). |
| `--timeout=<ms>` | Timeout por step em ms. Default 300000 (5 min). |

**Modos de execução:**
- `read-only` — só agentes determinísticos / read-only.
- `dry-run` — simula writeback sem aplicar (diff visível, audit log gravado).
- `writeback` — aplica no Shopify. **Sempre passa pelo writeback gate** (verifica jurisdição, perfil legal, aprovação humana).

**Saída:** plano em stdout + checkpoint em `07_memory/vault/tenants/<t>/[stores/<s>/]runs/<runId>.json`. Com `--execute`, cada step spawna `pnpm <agent-command>` em child_process; exit codes mapeiam para `StageStatus` (0=completed, 3=skipped_gracefully, *=failed_recoverable).

### Exemplos práticos

```bash
# 1. Plan-only (sem rodar nada) — só visualiza rota + camada legal
pnpm chief --tenant=incluo-tenant --store=incluo \
  --objective="auditar catálogo da loja Incluo"

# 2. Auditoria determinística end-to-end (zero credencial)
pnpm chief --tenant=incluo-tenant --store=incluo \
  --objective="audit catalog quality" --execute

# 3. Plano de marketing + criativo (precisa ANTHROPIC_API_KEY)
pnpm chief --tenant=incluo-tenant --store=incluo \
  --objective="planejar campanha de volta às aulas com 4 variantes criativas" \
  --jurisdictions=BR --execute

# 4. Review de PDP em UE (camada legal GDPR + CRD ativa se legal-profile presente)
pnpm chief --tenant=acme --store=de \
  --objective="revisar PDP do produto X" \
  --jurisdictions=EU --execute

# 5. Writeback Shopify seguro — passa pelo gate (token+scope+legal+approval)
pnpm chief --tenant=incluo-tenant --store=incluo \
  --objective="aplicar revisões de compliance no PDP contas-madeira" \
  --mode=writeback --execute

# 6. Retomar um run interrompido (checkpoint preservado)
pnpm chief --tenant=incluo-tenant --store=incluo --resume=run-1730000000-abc123
```

### Checklist antes do primeiro `--execute` em loja real

1. **legal-profile.json no vault** — copiar template:
   ```
   cp 07_memory/vault/templates/legal-profile.example.json \
      07_memory/vault/tenants/<tenantId>/stores/<storeId>/legal-profile.json
   ```
   Editar `jurisdictions`, `primaryLocale`, `existingPolicies`, `companyIdentity`.
2. **`.env.local`** com `ANTHROPIC_API_KEY` (agentes LLM) + `SHOPIFY_SHOP`/`SHOPIFY_ADMIN_TOKEN` (writeback).
3. **`pnpm doctor`** — todos 🟢 (gitleaks 🟡 não bloqueia).
4. **Plan-only primeiro** — rodar sem `--execute` e ler a rota antes de despachar.



## Verificação (rodar primeiro em qualquer clone novo)

| Comando | O que faz |
|---|---|
| `pnpm doctor` | **Diagnóstico cross-platform.** Checa: node ≥ 20, pnpm ≥ 9, git, `node_modules`, typecheck, lint, test:smoke, `.env.local`, gitleaks, cérebro presente. Exit 0 = baseline OK. |

## Setup / instalação

| Comando | O que faz |
|---|---|
| `pnpm install` | Instala deps de todos os workspaces (28+ pacotes). |
| `cp .env.example .env.local` | Cria env local. Editar manualmente. |
| `npx simple-git-hooks` | Ativa pre-commit (lint + smoke + secret-scan) + commit-msg (commitlint). |
| `bash 10_ops/scripts/clone-upstreams.sh` | (Opcional) Clona 10 upstreams pinados em `01_upstreams/`. |
| `pnpm clean` | Remove `dist/` e `.tsbuildinfo` de cada package. |

## Qualidade (rodar antes de commit)

| Comando | O que faz | Falha = block? |
|---|---|---|
| `pnpm typecheck` | `tsc -b` em todos os refs do tsconfig raiz. | sim |
| `pnpm lint` | `biome check .` (lint + format + organize imports). | sim |
| `pnpm format` | `biome format --write .` — aplica formatação. | n/a |
| `pnpm test` | `vitest run` — toda a suíte (376 testes em 42 arquivos, ~4s). | sim |
| `pnpm test:smoke` | só `11_tests/smoke/` (17 testes incl. multi-tenant isolation). | sim (pre-commit) |
| `pnpm secret-scan` | `gitleaks protect --staged` — só staged diff. | sim (pre-commit) |
| `pnpm commitlint` | Conventional Commits (ADR-0017). | sim em PR |

## Agentes executáveis

> **Identificação de contexto (multi-tenant/multi-store):**
> - `--tenant=<id>` é obrigatório para qualquer agente. Default `_test` (dev local).
> - `--store=<id>` é opcional. Quando passado, paths de output viram tenant/store-scoped (ver "Multi-tenant" abaixo).
> - Sem `--store`, agente opera tenant-level (compat com runs anteriores).

### Determinísticos (zero credencial)

| Comando | O que faz |
|---|---|
| `pnpm audit:repo <path> [--profile=full] [--capture]` | Auditor de repo (license + security + architecture). |
| `pnpm feed:dry-run [--source=fixture\|shopify] [--seo] [--first=N] [--capture]` | Pipeline catalog → feed → validação → dry-run report Merchant. |
| `pnpm merchant:audit [--source=fixture\|json\|shopify] [--file=path] [--tenant=<id>] [--store=<id>] [--gmc-default=<id>] [--gmc-mapping=<file>] [--capture]` | **Audit GMC determinístico com scoring por SKU + findings categorizados + remediação.** Output em `12_reports/merchant-audits/`. Exit 1 se há SKU red. |

### LLM (requerem `ANTHROPIC_API_KEY`)

| Comando | O que faz |
|---|---|
| `pnpm llm:smoke` | Smoke isolado (`OK` + custo ~$0.0001). |
| `pnpm synthesize:audit <audit.md> [--tenant=<id>]` | Sintetiza relatório do `audit:repo` em bullets + risco. |
| `pnpm curate:memory [--tenant=<id>] [--dry-run]` | Propõe promoções para `<tenant>/facts/`. |
| `pnpm context:brief --task="..." [--tenant=<id>]` | Context brief read-only para próximo agente. |
| `pnpm orchestrate:master --goal="..." [--tenant=<id>]` | Plano de execução multi-agente (Tier 0). |
| `pnpm market:intelligence --niche="..." [--tenant=<id>]` | Inteligência de mercado. |
| `pnpm competitor:benchmark --competitors="..." [--tenant=<id>]` | Benchmark competitivo. |
| `pnpm reviews:ops --reviews-file=<path> [--tenant=<id>]` | Voice-of-customer (temas/dores). |
| `pnpm product:offer --product-name="..." --description="..." --audience="..." --voice="..." [--tenant=<id>]` | Hero + value props + bundles + CTA. |
| `pnpm merchant:compliance --content-type=copy --content="..." [--tenant=<id>]` | Risco legal/PII em conteúdo. |
| `pnpm marketing:plan --horizon="..." --objective="..." --voice="..." --budget=N [--tenant=<id>]` | Plano de marketing (iniciativas). |
| `pnpm creative:assets --campaign="..." --theme="..." --audience="..." --voice="..." --offer="..." --channel=... --format=... --locale=... [--tenant=<id>]` | Copy variantes + visual brief. |
| `pnpm design:ux --scope=product --name="..." --summary="..." --style="..." --market=pt-BR:BRL:BR [--tenant=<id>]` | PDP blueprint + locale copy + a11y. |
| `pnpm traffic:plan --campaign="..." --product="..." --total-budget=N --daily-cap=N --cpa-target=N --channel=... [--tenant=<id>]` | Dry-run media plan (canais/audiências/hipóteses). |
| `pnpm journey:map ... [--tenant=<id>]` | Mapa de jornada do cliente. |
| `pnpm finance:radar --lines-file=<path> [--tenant=<id>]` | Radar de margem. |
| `pnpm visual:asset ... [--tenant=<id>]` | Brief visual (shot list). |
| `pnpm ads:plan ... [--tenant=<id>]` | Plano tático de anúncio. |
| `pnpm governance:qa --proposal-file=<path> [--tenant=<id>]` | Verdict (pass/warn/block). |

### Shopify (Admin API real)

| Comando | Credenciais | O que faz |
|---|---|---|
| `pnpm shopify:list-products [--first=N]` | `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` | Lista produtos via Admin GraphQL. |
| `pnpm shopify:writeback --tenant=<t> --store=<s> --revisions-file=<path> --product-handle=<h> [--field=descriptionHtml\|title] [--apply]` | nenhuma p/ dry-run; `SHOPIFY_SHOP`+`SHOPIFY_ADMIN_TOKEN` p/ `--apply` | **Loop fechado compliance → diff → (dry-run\|productUpdate) → audit log.** Default = dry-run. `--apply` é gate explícito. Audit log SEMPRE em `vault/tenants/<t>/stores/<s>/shopify-writeback/`. Severity HIGH dispara aviso para revisão jurídica antes de `--apply`. |

## Multi-tenant / multi-store

| Conceito | Onde mora | Quando usar |
|---|---|---|
| **Global** (sem tenant) | `07_memory/vault/projects/commerce-agent-os/` | dev brain canônico; runs sem tenant; `_test`/`_demo` |
| **Tenant-level** | `07_memory/vault/tenants/<tenantId>/` | operação da organização (cross-store) |
| **Store-level** | `07_memory/vault/tenants/<tenantId>/stores/<storeId>/` | operação específica de uma loja Shopify |

| Caso | Comando exemplo |
|---|---|
| Tenant-only (cross-store) | `pnpm merchant:audit --source=fixture --tenant=acme-corp --capture` |
| Tenant + store específica | `pnpm merchant:audit --source=json --file=<path> --tenant=acme-corp --store=acme-br --capture` |
| Dev local (sem tenant real) | `pnpm merchant:audit --source=fixture` _(default tenant `_test`)_ |

**Como evitar misturar contexto entre lojas:**
1. **Sempre passar `--tenant=<id>` explicitamente** quando rodar para uma loja real (nunca confiar em default).
2. **Passar `--store=<id>` se a operação é específica daquela loja.** Sem ele, captura vai para tenant-level (cross-store).
3. **Não copiar arquivos entre `tenants/<X>/` e `tenants/<Y>/` no filesystem** sem motivo claro — isolamento é por filesystem.
4. **Não compartilhar `.env.local`** com creds de loja A para rodar em loja B.

## Cérebro operacional

| Comando | O que faz |
|---|---|
| `pnpm ops:capture <input.json>` | Captura execução no cérebro standalone. Aceita JSON conforme `06_packages/brain-bridge/src/types.ts`. Aceita `tenantId` + `storeId` no JSON para roteamento. |

## Estrutura do repo

| Comando | O que faz |
|---|---|
| `bash 10_ops/scripts/validate-structure.sh` | Verifica as 13 pastas raiz numeradas. |

## Git / commits

Conventional Commits 1.0.0 obrigatório. Tipos: `feat` `fix` `docs` `chore` `refactor` `test` `build` `ci` `perf` `style`. CI roda em PR: lint + typecheck + smoke + commitlint.

## Tabela rápida

| Quero… | Comando |
|---|---|
| ambiente novo do zero | `pnpm install && pnpm doctor` |
| validar mudança antes de commit | `pnpm doctor` (cobre typecheck + lint + smoke) |
| rodar suíte completa | `pnpm test` |
| **mandar objetivo NL para o Chefe** | `pnpm chief --tenant=<t> --store=<s> --objective="..." --execute` |
| **ver rota antes de executar** | mesmo comando **sem** `--execute` |
| primeiro agente real (zero credencial) | `pnpm audit:repo .` |
| primeiro merchant audit (zero credencial) | `pnpm merchant:audit --source=fixture` |
| primeiro merchant audit em catálogo real (JSON) | `pnpm merchant:audit --source=json --file=<path> --tenant=<id> --store=<id> --gmc-default=3793 --capture` |
| primeiro LLM call real | `pnpm llm:smoke` (precisa `ANTHROPIC_API_KEY`) |
| configurar camada legal de uma loja | copiar `07_memory/vault/templates/legal-profile.example.json` para `tenants/<t>/stores/<s>/legal-profile.json` |
| ver onde estamos | abrir `00_meta/PROJECT_STATUS.md` ou `07_memory/vault/projects/commerce-agent-os/current-state.md` |
| ver o que puxar | abrir `07_memory/vault/projects/commerce-agent-os/next-actions.md` |
| ver passagem de bastão | abrir `07_memory/vault/projects/commerce-agent-os/handoff-log.md` |
