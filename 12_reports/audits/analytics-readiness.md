# Analytics readiness audit

Estado da camada de analytics em 2026-05-23.

## Resumo

| Área | Status |
|---|---|
| Agente `analytics-optimization` | schema completo (Fase 3b) + **flows.md novo** (4 fluxos) + fixtures JSON |
| `04_apps/analytics-service` | esqueleto Node (package.json + tsconfig + .env + src/{server, jobs, pipelines, queries, orchestration}) |
| `05_integrations/posthog` | adapter com taxonomia canônica de **9 superfícies × 30+ eventos** + propriedades + erros normalizados |
| `06_packages/observability` | já existe como package stub (Fase 3a); será o wrapper único de instrumentação |
| Doc arquitetural | `posthog-map.md` (detalhe + funil + sinais + attribution + PII) |
| Cloud vs self-host | **pendente decisão**; recomendação: Cloud EU |

## O que cada peça entrega hoje

### `03_agents/analytics-optimization/`

- `flows.md` novo: 4 fluxos (funnel diagnose, campaign performance, feed impact, cross-signal).
- `tests/fixtures/` com input/output exemplo de Fluxo 1.
- Schema (AGENT, prompt, contract, tools) já existente.

### `04_apps/analytics-service/`

- `package.json` (workspace `@cao/analytics-service`), `tsconfig`, `.env.example`, `.gitignore`.
- `src/server.ts` placeholder.
- `src/jobs/` — 5 jobs declarados (funnel-daily, campaign-perf-weekly, feed-change-impact, cross-signal-weekly, cost-vs-outcome-daily).
- `src/pipelines/` — 4 pipelines declarados.
- `src/queries/` — diretório central para HogQL canônicos com convenção de versionamento.
- `src/orchestration/` — camada fina para `@cao/runtime`.

### `05_integrations/posthog/`

- Workspace package `@cao/integration-posthog`.
- `client/index.ts` — `PostHogClient` com `capture`, `identify`, `featureFlag`, `hogQL`.
- `types/index.ts` — `EventName` branded, `CommonProperties`, `Identity`, `FlagPayload`, `HogQLResult`.
- `errors/index.ts` — 5 classes (Config, Taxonomy, **Pii**, Query, Quota). `PostHogPiiError` é hard-block.
- **`events-taxonomy.yaml`** — 9 surfaces (onsite, agent, feed, campaign, review, compliance, admin) com ~30 eventos canônicos. Reservados listados.
- **`properties-taxonomy.yaml`** — common + agent + commerce + UI + UTM + campaign + feed + review + governance + admin + **forbidden list** (PII).

### `02_architecture/integrations/posthog-map.md`

- Componentes envolvidos.
- Cloud vs self-host (decisão com recomendação).
- Surfaces que usamos.
- Funil canônico (5 steps com breakdowns).
- 9 sinais de otimização cross-source.
- **Ligação criativo↔campanha↔onsite** detalhada (UTM convention obrigatória).
- Política de PII.
- Custo/quotas + sampling.
- Decisões em aberto (sampling, distinctId, projetos por env).
- **Onde PostHog NÃO entra** (audit, domínio, estado).

## Estratégia de eventos (resumo)

- **Naming:** `<surface>.<verb>` snake_case. Canônico nos YAMLs.
- **Common properties** injetadas pelo adapter: `tenant_id`, `env`, `app`, `app_version`.
- **Validação** contra taxonomia em dev/staging (warn em prod).
- **PII scrub** hard-block antes de capture.
- **UTM convention obrigatória** para attribution: `utm_campaign=initiative_id`, `utm_content=asset_id`.

## Pré-requisitos externos

| Item | Necessário para | Notas |
|---|---|---|
| Conta PostHog (Cloud EU recomendado) | qualquer call | free tier suporta até 1M eventos/mês |
| Project API Key (write) | server + web capture | criado no dashboard |
| Personal API Key (read HogQL) | analytics-service queries | criado por user |
| Projeto separado para dev/staging | evitar contaminar prod | recomendado |
| Theme app extension ou pixel | onsite events | depende de Fase 8 (Shopify connect) |
| Domínio próprio com reverse proxy (opcional) | first-party tracking | melhor entrega; mais setup |

## Riscos identificados

| Risco | Mitigação |
|---|---|
| Taxonomia drift (eventos não documentados em uso) | validação em dev/staging contra YAML; CI checa |
| Custo de volume alto em prod | sampling em eventos baratos (page.viewed); alert de spike |
| PII vazando | adapter hard-rejects; forbidden list em YAML; CI lint contra strings óbvias |
| Attribution quebra silenciosamente | `traffic-campaigns` é único gerador de URL; tests garantem UTM completo |
| LGPD/GDPR para EU | Cloud EU + IP anonymization + retention configurada |
| HogQL queries quebrarem após schema change | queries versionadas em `analytics-service/src/queries/`; fixtures de evento |
| Quota PostHog estourar | alert de spike; downgrade para sampling se necessário |
| Self-host migration tardia | adapter unificado isola código — migrar é mexer só em `client/` |

## Decisões em aberto

- [ ] **Cloud EU vs US vs self-host** (proposto: Cloud EU).
- [ ] Sampling rates por evento de alto volume.
- [ ] `distinctId` strategy (anônimo session vs persistente).
- [ ] Habilitar LLM analytics quando GA.
- [ ] Projetos por env (`dev/staging/prod`) ou único com filtro.
- [ ] Theme app extension dedicada vs script tag direto.
- [ ] Reverse proxy first-party tracking.
- [ ] Identification de staff lojista — `user_id` Shopify confirmado como não-PII.

## Checklist "pronto para Fase 10"

- [ ] Conta PostHog criada (Cloud EU recomendado).
- [ ] Project + Personal API keys obtidas (dev).
- [ ] Decisão de modo (cloud/self-host) confirmada.
- [ ] `01_upstreams/posthog` **NÃO** clonado — só SDK (já decidido em ADR-0002).
- [ ] `@cao/runtime` mínimo (Fase 7).
- [ ] Fase 8 (Shopify connect) concluída — admin-app é onde `identify` acontece; tema é onde onsite captura.
- [ ] `@cao/observability` implementado consumindo o adapter.
- [ ] Política de PII em `@cao/guardrails` implementada antes de capture real.
- [ ] Decisões da seção anterior resolvidas (ou conscientemente deferidas).

## Próximo passo recomendado

Sequência continua a mesma:
1. Fase 5 — bootstrap funcional.
2. Fase 6 — clonar upstreams.
3. Fase 7 — `@cao/runtime`.
4. Fase 8 — Shopify connect.
5. Fase 9 — Merchant feed (já scaffoldada).
6. **Fase 10** — implementar `@cao/observability` consumindo este adapter; instrumentar 1 evento end-to-end (`agent.invoked` do `repo-auditor` é candidato — sem dependência de Shopify); migrar gradualmente os outros eventos conforme apps implementam.
