---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T16:10:00Z
tags: [blockers, risks]
source: human:incluobrasil
confidence: 1.0
---

# Blockers and Risks

**Para que serve:** registrar o que está travando avanço **agora** (bloqueios) e o que pode travar depois (riscos). Cada item tem mitigação clara e dono sugerido (papel, não pessoa).

**Como usar:** revisar antes de planejar próxima sub-fase. Bloqueio resolvido → mover para [session-log.md](session-log.md) e remover daqui. Risco que se materializou → vira bloqueio.

**Output que gera:** lista única do que precisa ser destravado e quem pode destravar.

---

## Bloqueios ativos

Itens que **impedem** uma ação concreta agora.

| # | Bloqueio | Impacto | Mitigação | Dono sugerido | Status |
|---|---|---|---|---|---|
| B1 | ~~`ANTHROPIC_API_KEY` não confirmada em dev~~ | — | — | ops | ✅ **resolvido** 2026-05-23 — key em `.env.local` (gitignored). ⚠ key apareceu em chat log; **rotacionar** após primeira execução N5 |
| B2 | ~~Nenhum upstream clonado em `01_upstreams/`~~ | — | — | dev | ✅ **resolvido** 2026-05-23 — `langgraph` + `shopify-app-template-react-router` clonados via `clone-upstreams.sh`, auditados, ambos MIT |
| B3 | ~~ADR-0007 (runtime alvo TS vs Python) não decidido~~ | — | — | tech lead | ✅ **resolvido** 2026-05-23 — ADR-0007 aceito (TS host + LangGraph JS como referência) |
| B4 | Trabalho local (núcleo + cérebro + repo-auditor + N4 + detector fix) não commitado em parte | dispersa estado entre local e remoto | commitar pacote final na branch `feat/core-runtime-and-first-agent` + push | dev | parcialmente resolvido (6 commits pushados; falta N4 commit) |
| B5 | `gitleaks` binário não instalado localmente | secret scan no pre-commit não roda; risco de commit acidental de chave | `winget install gitleaks` (Windows) ou `scoop install gitleaks` | ops | aguardando |

---

## Riscos

Itens que podem **piorar** se ignorados, mas ainda não bloqueiam.

| # | Risco | Probabilidade | Impacto | Mitigação | Dono sugerido | Status |
|---|---|---|---|---|---|---|
| R1 | Scope `@cao/` ser tomado no npm antes de release v1 | média | retrabalho de renomear todos os pacotes | reservar scope no npm antes de qualquer publicação pública | ops | monitorado |
| R2 | Upstreams (langgraph, dawn, etc.) com licença incompatível | baixa | bloqueio de uso comercial | confirmar licença de cada upstream ao clonar | dev | monitorado |
| R3 | `feedgen` ser Python pesado e não portável | média | atraso na Fase 9 | ADR-0011 já antecipa: sidecar Python isolado | tech lead | aceito |
| R4 | Custo de LLM crescer sem instrumentação | alta | gasto sem visibilidade | `@cao/observability` captura cost + token usage; revisar mensal | ops | mitigado |
| R5 | Cross-tenant leak em memória | baixa | crítico (privacy) | `@cao/memory` rejeita por construção; teste de isolamento já passa | dev | mitigado |
| R6 | Segredos commitados acidentalmente | média | crítico (vazamento) | `@cao/guardrails` detecta padrões + gitleaks no pre-commit (binário ainda pendente) | ops | parcial |
| R7 | Drift entre ADRs em queue e código criando defaults silenciosos | média | decisões viram fato consumado sem revisão | aceitar ADRs antes de cada nova sub-fase usar a área | tech lead | monitorado |
| R8 | Memória markdown crescer e ficar lenta | baixa | leitura/escrita degradada em > 10k arquivos | ADR-0005 prevê índice derivado quando necessário | dev | aceito |
| R9 | Ausência de DB de aplicação (ADR-0010 aberto) força workaround | média | retrabalho ao trocar storage | decidir antes da Fase 8 produção | tech lead | aberto |
| R10 | Equipe pequena → qualquer ausência paralisa | alta | continuidade | cérebro operacional + sync-protocol mantêm contexto entre operadores | ops | mitigado parcial |
| R11 | Múltiplos operadores editando cérebro em paralelo geram conflito | média | confusão de estado, retrabalho | [sync-protocol.md](sync-protocol.md) define convenções; arquivos curados pequenos; logs append-only | ops | mitigado |

---

## Convenções

- Probabilidade e impacto: baixa / média / alta.
- Status: `aberto` / `monitorado` / `mitigado` / `aceito` / `materializado`.
- Bloqueios numerados B1, B2, …; riscos R1, R2, … — números não são reciclados.
