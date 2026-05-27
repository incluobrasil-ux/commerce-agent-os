---
created_at: 2026-05-27T00:50:00Z
updated_at: 2026-05-27T00:50:00Z
tags: [chief, dispatcher, orchestration, legal-profile, milestone]
source: mixed
kind: implementation-milestone
result: green
confidence: 1.0
related:
  - 06_packages/orchestration/src/dispatcher.ts
  - 06_packages/orchestration/src/legal-loader.ts
  - 06_packages/orchestration/src/planner.ts
  - 06_packages/orchestration/scripts/chief-cli.ts
  - 07_memory/vault/templates/legal-profile.example.json
---

# Dispatcher real do Chefe — `pnpm chief --execute` invoca agentes de verdade

## Contexto

O commit `0f3b378` (Chefe consolidado, 2026-05-26) entregou todo o esqueleto operacional do `@cao/orchestration`: registry de 22 agentes, 8 playbooks oficiais, planner rule-based, runner com state machine + checkpoints, writeback gate, camada legal BR/EU/US com 11 regras. Mas o **dispatcher** continuava `noopDispatcher` — o Chefe **planejava** rotas corretamente mas **não invocava** os agentes. `--execute` apenas imprimia "executando X" e marcava completed sem rodar nada. Esta sessão fechou esse gap.

## O que aconteceu

- **Novo módulo [`dispatcher.ts`](../../../../06_packages/orchestration/src/dispatcher.ts)** — `makeShellDispatcher({ cwd, logger, executable, timeoutMs })` constrói um `StepDispatcher` que spawna `pnpm <agent-command> --tenant=<t> --store=<s>` via `child_process`. Cross-platform (`shell: true` no Windows). Mapeamento de exit code → `StageStatus`: `0=completed`, `3=skipped_gracefully` (credencial faltando), `2=failed_terminal`, demais = `failed_recoverable`. Streaming de stdout/stderr via `logger`. Timeout configurável (default 5min).
- **Novo módulo [`legal-loader.ts`](../../../../06_packages/orchestration/src/legal-loader.ts)** — `loadLegalProfileFromVault({ vaultRoot, tenantId, storeId })` auto-carrega `legal-profile.json` por convenção de path: tenta `tenants/<t>/stores/<s>/legal-profile.json` → cai em `tenants/<t>/legal-profile.json` → retorna null. Caller decide se segue sem camada legal ou bloqueia.
- **[`planner.ts`](../../../../06_packages/orchestration/src/planner.ts) ajustado** — `bundle.requiredPolicies` agora é populado a partir de `playbook.requiredPolicies` (campo existia mas nunca era atribuído).
- **[`chief-cli.ts`](../../../../06_packages/orchestration/scripts/chief-cli.ts) rewriteado** — substituiu o dispatcher noop pelo `makeShellDispatcher({ executable: true })`. Auto-load do legal-profile do vault quando `--legal-profile=` não é passado. Exit code agora reflete `finalBundle.status` (1 se não completou). Nova flag `--timeout=<ms>`.
- **Template no vault** — [`07_memory/vault/templates/legal-profile.example.json`](../../../templates/legal-profile.example.json) (versionado) + [README explicando os campos](../../../templates/legal-profile.README.md) e fluxo de cópia para `tenants/<t>/stores/<s>/legal-profile.json` (não-versionado).
- **10 testes novos** — 4 dispatcher (dry-plan, agente library-only, agente não-registrado, sem `--store` quando `_no-store_`); 5 legal-loader (null quando ausente, store-level, fallback tenant-level, só tenant, `legalProfilePathFor`); 1 planner (requiredPolicies populated).
- **Lint quebrou após write** — 2 safe-fixes do biome: imports do `chief-cli.ts` fora de ordem alfabética + uma linha longa de log no dispatcher. Resolvido com `pnpm format` + 1 edit manual de `organizeImports`.

## Achados / decisões

- **Convenção de exit code dos agentes** — `0` sucesso, `1` recuperável, `2` arg inválido (terminal), **`3` SKIPPED gracioso** (credencial faltando). Documentado no header do dispatcher.ts e em COMMANDS.md. Agentes existentes já usam `0/1/2`; nenhum usa `3` ainda — pode ser adotado incremental sem quebrar nada.
- **Não chamar agentes em-process** — runner permanece agnóstico. Spawn via shell mantém isolamento (cada agente roda em seu próprio processo com seu próprio runtime/cache), zero dependência circular com pacotes de agentes, paridade com como o operador roda manualmente.
- **Auto-load do legal-profile com fallback tenant-level** — store-specific pode ser ausente em estados iniciais; tenant-level cobre default conservador para todas as lojas da org.
- **`requiredPolicies` no bundle** — campo já existia (Fase 4), agora é populado. Próximo step natural: writeback-gate pode bloquear ANTES de tocar Shopify se `requiredPolicies` não estiverem em `profile.existingPolicies`.

## Impacto

- **Chefe agora opera de verdade**: `pnpm chief --tenant=<t> --store=<s> --objective="..." --execute` invoca a rota inteira, persiste checkpoint por step, retomável via `--resume=<runId>`.
- **Suíte: 333 → 376 verdes** em 42 arquivos (orchestration foi de 28 para 38 testes). Smoke 17/17 mantido. Typecheck verde. Lint verde.
- **Time pode mandar objetivo em linguagem natural** sem precisar decorar 24 comandos CLI. Plan-only (default) mostra rota; `--execute` despacha.
- **Loops BR/EU/US fecham** em código: planner + legal-loader + writeback-gate + dispatcher real. Lacuna restante é só operacional (provisionar tokens + escrever `legal-profile.json` por loja).

## Ações geradas

- [ ] Cada loja real precisa de `legal-profile.json` em `07_memory/vault/tenants/<t>/stores/<s>/` (template + README disponíveis).
- [ ] Provisionar `SHOPIFY_ADMIN_TOKEN` para destravar `--mode=writeback` real (N27).
- [ ] Adotar exit code `3` (SKIPPED gracioso) nos 17 agentes LLM quando `ANTHROPIC_API_KEY` ausente — hoje saem com `0` e log "SKIPPED" mas dispatcher os marca como completed; convenção `3` melhora a precisão do bundle.
- [ ] Substituir warning "legal-profile ausente" por blocker em runs `--mode=writeback` (hoje é só aviso).

## Referências

- código: `06_packages/orchestration/src/{dispatcher,legal-loader,planner}.ts`
- CLI: `06_packages/orchestration/scripts/chief-cli.ts`
- template: `07_memory/vault/templates/legal-profile.{example.json,README.md}`
- docs: `00_meta/PROJECT_STATUS.md` · `10_ops/scripts/COMMANDS.md`
- branch: `feat/orchestrator-os-consolidation`
