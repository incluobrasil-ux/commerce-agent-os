# Security / QA readiness audit

Estado da camada de segurança, qualidade e governança em 2026-05-23.

## Resumo

| Área | Status |
|---|---|
| Agente `governance-risk-qa` | schema completo + state-machine + **flows.md novo** (3 fluxos) + fixtures (caso "block" com 5 violations) |
| Modelo de segurança macro | `02_architecture/security-model/security-overview.md` (Fase 4) |
| Mapa QA/governance cross-cutting | `02_architecture/security-model/qa-governance-map.md` **novo** |
| Checklist operacional | `10_ops/security/security-checklist.md` **novo** |
| Estratégia de testes | `11_tests/README.md` + 5 camadas (smoke, contract, integration, e2e, performance) com README cada |
| `@cao/guardrails` (package) | stub desde Fase 3a; implementação pendente Fase 7 |
| Upstreams (`agentshield`, `ECC`, `gstack`) | **nenhum clonado** — referência conceitual apenas |

## O que cada peça entrega hoje

### `03_agents/governance-risk-qa/`

- `flows.md` novo: 3 fluxos (revisão única, batch, replay) com ordem deterministic→semantic.
- 2 fixtures JSON com caso "block" cobrindo 5 violations distintas (brand voice, regulated claim, substantiation, GTIN, missing attribute).
- 7 artifact_types suportados (`product_description`, `feed_row`, `creative_image`, `creative_video`, `campaign_plan`, `review_response`, `generic`).
- Política de severidade (`hard` vs `soft`) explícita.
- Loop infinito protegido via `attempt_count > N → block`.

### `02_architecture/security-model/qa-governance-map.md`

- **4 linhas de defesa** (schema-time → runtime guardrails → governance agent → humano).
- **7 riscos de upstream** com mitigação.
- Política de edição de upstream (header obrigatório + ADR-0002).
- **12 critérios mínimos de QA** (8 para merge + 4 adicionais para release v1).
- **5 camadas de teste** (smoke, contract, integration, e2e, performance) + matriz de "onde QA encontra cada classe de problema".
- Como agentshield/ECC/gstack entram (referência conceitual).

### `10_ops/security/security-checklist.md`

- ~50 itens distribuídos em 11 categorias (secrets, PII, upstreams, deps, auth, agentes, multi-tenant, logs, network, CI, release).
- Cada item marcado com when:
  - `[L]` local (pre-PR)
  - `[C]` CI (cada push)
  - `[M]` mensal
  - sem marca = release v1
- Itens fora de escopo v0/v1 listados explicitamente (pentest externo, SOC2, bug bounty).

### `11_tests/`

- README atualizado com 5 camadas.
- Cada subdir (`contract`, `integration`, `e2e`, `performance`) tem README com:
  - Por que existe
  - O que cobre
  - Stack proposta
  - Convenções (naming, tempo alvo, quando roda)
  - Lista de testes previstos
  - Status (stub — implementação acompanha Fases 5–12)
- `smoke/` continua com 2 stubs funcionais da Fase 4.

## Estratégia de testes resumida

| Camada | Tempo | Externalidades | Quando roda | Falha = block? |
|---|---|---|---|---|
| Smoke | < 30s | zero | pre-commit + CI | sim |
| Unit (colocalizado) | < 2min total | zero | pre-commit + CI | sim |
| Contract | < 5min | zero (mocks fixos) | CI | sim |
| Integration | < 15min | DB local, mocks | CI principal | sim |
| E2E | até 30min | staging completo | nightly + release | release sim, daily não |
| Performance | budget per test | métricas baseline | CI principal | regressão > 20% bloqueia |

## Riscos de upstream + política (sumário)

- `01_upstreams/` **READ-ONLY** (ADR-0002).
- Header obrigatório em adaptações: URL + SHA + license + adaptations.
- 7 classes de risco mapeadas: licença incompatível, CVE em deps, eval/execução, secrets hardcoded, sem manutenção, schema break, atribuição faltando.
- `repo-auditor` agente automatiza checks na ingestão de upstream novo.
- ADR-0002 prevê 3 métodos de ingestão (submodule / clone raso / SDK).

## Critérios mínimos de QA (para merge em `main` a partir de Fase 5)

1. `pnpm typecheck` verde
2. Smoke verde
3. Contract tests verdes (se relevante)
4. Lint verde
5. Sem secrets em commit
6. Sem PII em fixtures
7. Origem registrada (header) se adaptou upstream
8. Doc correspondente atualizada (contract.yaml/flows.md/taxonomies/etc.)

Plus para release v1: integration green, e2e green, performance budgets met, security checklist completo.

## Gaps críticos

1. **`@cao/guardrails` não implementado.** Sem ele, nada do que está documentado no agente `governance-risk-qa` funciona em runtime. Bloqueia toda ação destrutiva real. **Fase 7**.

2. **`agentshield` não clonado** em `01_upstreams/`. Base operacional do `@cao/guardrails` depende de inspecionar patterns reais. **Fase 6**.

3. **Lint/SAST/secret-scan ferramentas não escolhidas.** Sem essas, `[C]` items do checklist não são executáveis. ADR pendente. **Fase 5**.

4. **vitest não adicionado** como devDep. Sem ele, nenhum teste roda além dos smoke shell. **Fase 5**.

5. **Secret manager para produção não decidido.** v1 milestone.

6. **Política de retenção de `07_memory/` e logs PostHog não definida.** Bloqueia LGPD/GDPR compliance real. v1 milestone.

7. **CI pipeline não criado.** Itens `[C]` são aspiracionais até existir CI. **Fase 5 fim** ou Fase posterior dedicada.

8. **E2E ambiente staging não montado.** Bloqueia testes E2E reais. Depende de Fases 7+.

9. **Performance baselines vazias.** Sem implementação, não há baseline; primeiros valores virão com primeiros agentes reais.

10. **Override humano em `block`** ainda não modelado em UI (`shopify-admin-app`). Hoje o agente bloqueia; falta a UI mostrar "approve override" + audit dessa ação.

## Decisões em aberto

- [ ] Lint stack (eslint vs biome).
- [ ] Test runner default (vitest candidato).
- [ ] Secret scanner (gitleaks candidato).
- [ ] Dependency bot (Dependabot vs Renovate).
- [ ] SAST (Semgrep candidato).
- [ ] DAST necessário para v1?
- [ ] Performance budget baselines.
- [ ] Política de override humano em `block`.
- [ ] Política de retenção de `07_memory/<tenant>/`.
- [ ] Secret manager para prod.

## Checklist "pronto para Fase 7" (`@cao/guardrails` mínimo)

- [ ] Fase 5 (bootstrap funcional) concluída.
- [ ] Fase 6 (`agentshield` clonado em `01_upstreams/`).
- [ ] vitest + zod adicionados como devDeps + deps.
- [ ] Lint stack decidida.
- [ ] Secret scanner decidido.

## Próximo passo recomendado

Esta fase é **arquitetural sobre segurança/QA**. Próximas implementações:
1. **Fase 5** — bootstrap funcional habilita as ferramentas (vitest, secret scan).
2. **Fase 6** — clonar `agentshield` desbloqueia `@cao/guardrails`.
3. **Fase 7** — `@cao/guardrails` + `@cao/runtime` mínimo permitem agente `governance-risk-qa` rodar.
4. Contract tests dos agentes começam na **Fase 5** (já dá para testar schemas com fixtures existentes).
5. Integration/E2E acompanham fases de implementação real (8+).
