---
created_at: 2026-05-28T14:35:00Z
updated_at: 2026-05-28T14:35:00Z
tags: [product-mining, ecommerce-pipeline, higgsfield, sidecar, integration, milestone]
source: mixed
kind: implementation-milestone
result: green
confidence: 1.0
related:
  - 05_integrations/ecommerce-pipeline/
  - 06_packages/orchestration/src/registry.ts
  - 06_packages/orchestration/src/playbooks.ts
---

# Pipeline de descoberta de produto plugado ao Chefe (sidecar externo `~/ecommerce-pipeline`)

## Contexto

Usuário pediu para integrar um pipeline Python autônomo de **dropshipping** (mineração AliExpress → curadoria → geração de imagens via Higgsfield AI) ao commerce-agent-os, **sem quebrar** os 378 testes existentes nem mexer nos 22 agentes já catalogados. O pipeline já existia, pronto e funcional, em `https://github.com/incluobrasil-ux/ecommerce-pipeline` clonado em `C:\Users\ro--2\ecommerce-pipeline` com `projects/mireloo/` configurado.

## Decisão estrutural

**Manter o pipeline FORA do monorepo.** Justificativas:

1. Pipeline tem ciclo próprio de `git pull` e `projects/<loja>/` — mover quebraria caminhos relativos do `pipeline.py` (usa `ROOT = Path(__file__).parent`).
2. Imagens geradas vão para `Área de Trabalho/<loja>/imagens de produto/` (via `SHGetFolderPathW` com suporte OneDrive redirect) — fora de qualquer repo já.
3. CLAUDE.md do monorepo permite "Python só em sidecar isolado" — externo respeita o limite.
4. Existe sobreposição parcial com `creative-ops-service`, `creative-copy-assets`, `visual-asset-ops` que **NÃO foram tocados** — a nova função entra em harmonia, não substitui.

## O que aconteceu

### Novo package `@cao/ecommerce-pipeline` (`05_integrations/ecommerce-pipeline/`)

11 arquivos novos:

- `index.ts` — re-exports da public API
- `client/index.ts` — `resolvePipeline()`, `assertProjectExists()`, `runStep()` via `child_process.spawn` com timeout configurável, streaming stdout/stderr line-by-line, exit code passthrough. Mesmo padrão do `makeShellDispatcher` do `@cao/orchestration`.
- `client/resolve.test.ts` — 8 testes (pipeline_root_not_found 2x, project_not_found, detecção venv Windows, fallback "python", pythonExecutable explícito)
- `types/index.ts` — `ProjectConfig`, `RunOptions`, `RunResult`, `PipelineStep` espelhando schema do `project.json` documentado no CLAUDE.md do pipeline Python
- `errors/index.ts` — `EcommercePipelineError` com `code` discriminado (`pipeline_root_not_found | python_not_found | project_not_found | step_failed | timeout`)
- `scripts/run-cli.ts` — CLI `pnpm mining:run --project <nome> --step <step> [--limit N]`
- `package.json`, `tsconfig.json`
- 4 READMEs (raiz + client + types + errors)

### Configuração

- `ECOMMERCE_PIPELINE_ROOT` (env var) → caminho do repo Python. Default: `~/ecommerce-pipeline`
- Python detecta `.venv/Scripts/python.exe` (Windows) → `.venv/bin/python` (POSIX) → fallback `python`
- Timeouts default: mine 10min, curate 5min, images 30min, all 45min

### Agente novo no registry

```ts
{
  name: 'product-mining',
  tier: 5,
  purpose: 'Pipeline AliExpress: minera por queries, cura por avaliação/pedidos/preço, gera imagens via Higgsfield. Sidecar Python externo invocado via @cao/ecommerce-pipeline.',
  modes: ['read-only', 'planning'],
  credentials: ['none'],
  kind: 'deterministic',
  contextSupport: 'tenant-or-store',
  sideEffects: 'writes-external',  // ← imagens vão pra Área de Trabalho, fora do vault
  pnpmCommand: 'mining:run',
  executable: 'real',
}
```

### Playbook novo

`product-discovery-pipeline`: `product-mining` (obrigatório) → `merchant-compliance` (opcional) → `governance-risk-qa` (opcional). `requiresHumanApproval: true`, `defaultExecutionMode: read-only`, `requiredPolicies: []` (sem gate jurídico pesado porque é descoberta, não writeback).

### Setup do ambiente Python (no repo externo)

- `python -m venv .venv` em `C:\Users\ro--2\ecommerce-pipeline\.venv`
- `pip install -r requirements.txt` → pillow 12+, numpy 2+, piexif, camoufox 0.4+, playwright 1.60+, python-dotenv
- `playwright install chromium` → browser baixado
- `.env` do pipeline preenchido com `AE_APP_KEY=535332`, `AE_APP_SECRET`, `AE_ACCESS_TOKEN`, `AE_REFRESH_TOKEN` (gitignored pelo `.gitignore` próprio do pipeline)
- Higgsfield CLI: já estava em `C:\Users\ro--2\AppData\Local\higgsfield\hf.exe` v0.1.40, autenticado (descoberto via `hf auth token` retornando token válido `hf_lEpsr2…`)

## Achados / decisões

- **Pipeline fica externo, não vira `04_apps/ecommerce-pipeline/`.** Mover quebraria caminhos relativos do Python + desacoplaria do `git pull` próprio + perderia ciclo de evolução independente.
- **Wrapper é minimalista** — só path resolution + child_process. Zero duplicação de lógica do pipeline.
- **`.env` do pipeline ≠ `.env.local` do monorepo.** Credenciais AliExpress vivem só no `.env` do repo Python externo. Nada exposto no monorepo.
- **CLI default é "all" + sem `--limit`.** Mas regra operacional declarada pelo usuário no prompt: rodar `images --limit 1` com aprovação produto-a-produto (segurança contra gerar lote ruim).
- **`use_flash_draft: false` + `compare_hero_models: false` + `model: 'nano_banana'`** vão ser hardcoded no `project.json` da nova loja (usuário enfatizou: nunca `nano_banana_2`).
- **Sem novo `legal-profile.json`** — pipeline é descoberta/dry-run, não toca Shopify ainda. Quando virar publicação real, aí sim aciona writeback-gate existente.

## Impacto

- Nova capacidade end-to-end pronta sem regressão: descobrir produto candidato → curar → ter imagens profissionais aprovadas — tudo sob 1 comando (`pnpm mining:run`).
- Chefe agora tem 23 agentes no registry (era 22) e 9 playbooks (era 8).
- Padrão "sidecar Python externo via wrapper TS minimalista" agora replicável para futuros pipelines Python (ports de `feedgen`, scrapers especializados, etc.).
- **386 testes verdes** (era 378), +8 do wrapper, zero quebra.

## Métricas

| | Antes | Depois |
|---|---|---|
| Test files | 42 | 43 |
| Tests | 378 | 386 |
| Agentes no registry | 22 | 23 |
| Playbooks | 8 | 9 |
| pnpm scripts | 30 | 31 |
| Integrations | 6 | 7 |

## Ações geradas

- [x] **Lido** `MOLD_AND_CO_Brand_Book_Store_Structure_Guide_2026.pdf` (20 páginas via pypdf).
- [x] **Construído** `projects/moldandco/project.json` no repo externo: 4 collections (BLOOM-Garden, BLOOM-Charm, FORGE-Weave, FORGE-Leather Lab), pricing US/USD, model `nano_banana`, `use_flash_draft:false`, `compare_hero_models:false`.
- [ ] **(EM ABERTO — aguarda decisão do usuário)** Rodar mine → curate → `images --limit 1` para MOLD & CO. Comando: `pnpm mining:run --project moldandco --step mine` (depois curate, depois images com limit).
- [ ] **(EM ABERTO — aguarda usuário)** Processar PDFs adicionais (`movecon_identidade_visual_v2.pdf` e/ou outros que o usuário enviar) → mais projetos em `~/ecommerce-pipeline/projects/<loja>/`.
- [x] Commit + push da branch + atualizar PR #19 com a nova função (esta sessão).

## Referências

- código: `05_integrations/ecommerce-pipeline/`
- registry entry: `06_packages/orchestration/src/registry.ts` (busque por `product-mining`)
- playbook: `06_packages/orchestration/src/playbooks.ts` (`product-discovery-pipeline`)
- repo Python: `https://github.com/incluobrasil-ux/ecommerce-pipeline` → `C:\Users\ro--2\ecommerce-pipeline`
- Higgsfield: `C:\Users\ro--2\AppData\Local\higgsfield\hf.exe`
- comando: `pnpm mining:run --project <nome> --step <mine|curate|images|all> [--limit N]`
