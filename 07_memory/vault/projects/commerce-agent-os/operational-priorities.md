---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T16:10:00Z
tags: [priorities, backlog]
source: mixed
confidence: 1.0
---

# Operational Priorities

**Para que serve:** fila viva de prioridades da operação. **Substitui** o antigo `active-todos.md` (deletado). Difere de [next-actions.md](next-actions.md): aqui é o pool completo agrupado em horizontes; lá são as ~7 ações imediatas em ordem.

**Como usar:** revisar no início de cada sessão. Operador move itens entre `agora`/`próximo`/`depois` conforme contexto. Antes de editar, **ler [sync-protocol.md](sync-protocol.md)** para não pisar em mudança paralela.

**Output que gera:** lista única de "o que pode ser puxado em seguida" com dono, dependência e status.

**Convenções:**
- `agora` = pode ser puxado nesta semana sem destravar nada.
- `próximo` = depende de algo em `agora` ou de decisão pendente.
- `depois` = válido mas não prioritário.
- `status`: `aberto` / `em curso` / `em revisão` / `bloqueado`.
- `dono sugerido` = papel (`dev` / `tech lead` / `ops` / `produto`), não pessoa — adoção real vira atribuição em PR/issue.

---

## Agora

| # | Objetivo | Dono sugerido | Depende de | Status |
|---|---|---|---|---|
| P1 | Commitar trabalho local (`feat/core-runtime-and-first-agent`) + abrir PR | dev | — | aberto |
| P2 | Confirmar `ANTHROPIC_API_KEY` em dev (`.env.local`) | ops | — | aberto |
| P3 | Aceitar ADR-0007 (runtime alvo TS via LangGraph JS) | tech lead | P1 | aberto |
| P4 | Clonar `langgraph` + `shopify-app-template` em `01_upstreams/` + rodar `pnpm audit:repo` em cada | dev | P3 | aberto |
| P5 | LLM end-to-end: 1 agente invoca Anthropic via `runAgent()` e produz audit log | dev | P1, P2, P3 | aberto |

## Próximo

| # | Objetivo | Dono sugerido | Depende de | Status |
|---|---|---|---|---|
| P6 | Curar resumos das execuções de P4 e P5 em `run-summaries/` + atualizar index | quem fez P4/P5 | P4 ou P5 | aberto |
| P7 | Polish residual (`gitleaks` binário, `simple-git-hooks` ativo via `npx simple-git-hooks`) | ops | P1 mergeado | aberto |
| P8 | Aceitar ADR-0008 (worker queue — default BullMQ + Redis) | tech lead | — | aberto |
| P9 | Aceitar ADR-0010 (DB de aplicação — Postgres prod / SQLite dev) | tech lead | — | aberto |
| P10 | Clonar restantes 8 upstreams alta prioridade + rodar `pnpm audit:repo` em cada | dev | P4 (primeiro pair concluído) | aberto |
| P11 | Branch protection: enforce status checks (lint, typecheck, test:smoke) no PR | ops | P1 mergeado | aberto |

## Depois

| # | Objetivo | Dono sugerido | Depende de | Status |
|---|---|---|---|---|
| P12 | Materializar `app/root.tsx` + `shopify.server.ts` no admin-app | dev | upstream + OAuth dev store | aberto |
| P13 | Implementar client real `05_integrations/shopify/client/` (Admin GraphQL) | dev | upstream + OAuth | aberto |
| P14 | Aceitar ADR-0011 (estratégia feedgen Python) | tech lead | — | aberto |
| P15 | Aceitar ADR-0013 (PostHog cloud vs self-host) | produto | — | aberto |
| P16 | Aceitar ADR-0012 (provedor reviews default) | produto | — | aberto |
| P17 | Aceitar ADR-0014 + ADR-0015 (mídia + storage) | produto + ops | — | aberto |
| P18 | Aceitar ADR-0016 (secret manager) | ops | — | aberto |
| P19 | Runbook completo em `10_ops/runbooks/` | ops | — | aberto |
| P20 | Política de retenção de `07_memory/` (LGPD/GDPR) | ops | — | aberto |
| P21 | Performance baselines em `12_reports/perf-baselines/` | dev | apps reais rodando | aberto |

---

## Regras de manutenção

- Máximo ~5 itens em `agora`. Excedeu → repriorizar e empurrar para `próximo`.
- Item sem dono sugerido claro vai direto para `depois`.
- Bloqueio entra na coluna `depende de`.
- Item concluído → registrar em [session-log.md](session-log.md) + remover daqui. Se produziu artefato relevante, virar [run-summary](run-summaries/).
- Mudança nesta lista exige bater `updated_at` no frontmatter.
- Conflito de edição → ver [sync-protocol.md](sync-protocol.md).
