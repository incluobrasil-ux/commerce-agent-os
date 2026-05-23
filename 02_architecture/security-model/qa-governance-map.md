# QA / Governance map

Mapa cross-cutting de **segurança, qualidade e governança**. Complementa [`security-overview.md`](./security-overview.md) (que cobre o modelo de segurança macro) com foco em **QA + risco de upstream + critérios mínimos**.

> Não é manifesto. É política operacional curta + onde cada coisa mora.

## Linhas de defesa

```
┌── L1 — schema-time ──────────────────────────────────────┐
│  @cao/shared-types + @cao/shared-schemas                 │
│  Tipos branded; validação zod no boundary; CI typecheck  │
└──────────────────────────┬───────────────────────────────┘
                           │
┌── L2 — runtime guardrails ─────────────────────────────┐
│  @cao/guardrails (base agentshield)                    │
│  Input/output validation; allow-list de ações;         │
│  PII scrub; secret scan; rate limit                    │
└────────────────────────┬───────────────────────────────┘
                         │
┌── L3 — agente governança ─────────────────────────────┐
│  03_agents/governance-risk-qa                         │
│  Decide approve | revise | block em artefatos         │
│  Toda ação destrutiva ou publish passa aqui           │
└────────────────────────┬──────────────────────────────┘
                         │
┌── L4 — humano ────────────────────────────────────────┐
│  shopify-admin-app exibe pendentes;                   │
│  override humano sempre disponível                    │
└───────────────────────────────────────────────────────┘
```

Princípio: **defense in depth**. Falha de uma camada ainda permite que a próxima pegue. Nenhuma camada é "a única".

## Riscos de upstream (e mitigações)

ADR-0002 cobre a política. Aqui o operativo:

| Risco | Como acontece | Mitigação |
|---|---|---|
| **Licença incompatível** | upstream tem licença restritiva (GPL forte, BUSL); copiamos código sem perceber | `repo-auditor` agente roda na ingestão; bloqueia adoção sem ADR explícito |
| **Vulnerabilidade em deps transitivas** | upstream puxa biblioteca com CVE | `pnpm audit` em CI; deps pinadas; Dependabot/Renovate (a configurar) |
| **Código com `eval` ou execução arbitrária** | upstream executa string como código | grep block em CI: `eval(`, `Function(`, `child_process.exec` sem args estáticos |
| **Segredos hardcoded no upstream** | API keys, tokens de teste expostos | `secretScan` em `01_upstreams/` na ingestão; nunca executar sem revisão |
| **Upstream sem manutenção** | repo morto, sem patches de segurança | review periódica em `00_meta/REPO_SELECTION.md`; substituir se necessário |
| **Schema break** | upstream muda interface; nossa cópia/adaptação quebra | versão pinada (submodule SHA ou clone raso pinado); update é PR consciente |
| **Atribuição faltando** | adaptamos código sem header de origem | code review checklist; lint custom (futuro) |

## Política de edição (resumo)

- **`01_upstreams/` é READ-ONLY.** Nunca editar (ADR-0002).
- Adaptações de código upstream vão para `06_packages/<lib>/` ou `05_integrations/<adapter>/` com **header obrigatório**:
  ```
  // Adapted from <upstream URL>@<SHA>
  // Original license: <SPDX>
  // Adaptations: <resumo>
  ```
- PR que falha o code review checklist (header ausente, licença incompatível) **não merge**.
- Atualização de versão de upstream é PR explícito com nota: o que mudou, por que precisamos atualizar.

## Critérios mínimos de QA (gate para "merge")

Antes de merge em `main` (a partir de Fase 5):

1. **Typecheck verde** — `pnpm typecheck` em todos os packages afetados.
2. **Smoke verde** — `bash 10_ops/scripts/validate-structure.sh` + `bash 11_tests/smoke/*.sh`.
3. **Contract tests verdes** — se PR mexe em `contract.yaml` de agente, ou em `shared-schemas`, contract tests rodam.
4. **Lint verde** — formato + regras (Fase 5 instala lint real).
5. **Sem secrets em commit** — `secretScan` no diff.
6. **Sem PII em fixtures de teste** — `redactPII` check em arquivos `tests/fixtures/`.
7. **Origem registrada** — se PR adapta código upstream, header presente.
8. **Documentação correspondente atualizada** — `contract.yaml` mudou? `flows.md` reflete? `events-taxonomy.yaml` mudou? `posthog-map.md` reflete?

Antes de release v1:

9. **Integration tests verdes** com fixtures reais (Shopify de dev, etc.).
10. **E2E verde** em ambiente staging.
11. **Performance budgets** dentro do alvo (definidos em `11_tests/performance/`).
12. **Security checklist completo** (`10_ops/security/security-checklist.md`).

## Estratégia de testes (4 camadas + smoke)

Ver [`11_tests/README.md`](../../11_tests/README.md) e cada subdir.

| Camada | Onde | Quando roda | Tempo alvo | Externalidades |
|---|---|---|---|---|
| **Smoke** | `11_tests/smoke/` | sempre (pre-commit + CI) | < 30s total | zero rede |
| **Unitários** | colocalizados (`<file>.test.ts`) | sempre (pre-commit + CI) | < 2min total | zero rede |
| **Contract** | `11_tests/contract/` | CI | < 5min total | zero rede (mock fixo) |
| **Integration** | `11_tests/integration/` | CI principal (não pre-commit) | < 15min | DBs locais, fixtures reais |
| **E2E** | `11_tests/e2e/` | nightly + release | até 30min | ambiente staging completo |
| **Performance** | `11_tests/performance/` | CI principal, budgeted | budget por teste | métricas baseline |

## Onde QA encontra cada classe de problema

| Classe | Camada que pega |
|---|---|
| Tipo errado em código autoral | typecheck (CI) |
| Schema run-time inválido | contract tests + adapter em runtime |
| Endpoint quebrado | integration (com mock controlado) |
| Regressão em fluxo completo | E2E |
| Custo LLM explodindo | performance (budget assertions) |
| Brand violation em copy gerado | governance-risk-qa runtime + contract test do schema |
| PII vazando | guardrails runtime + lint custom em fixtures (futuro) |
| Secret em commit | `secretScan` em pre-commit + CI |

## Como agentshield, ECC, gstack entram

- **`affaan-m/agentshield`** → base operacional de `@cao/guardrails`. Patterns concretos: input validation, output validation, action allow-list, audit log. Cherry-pick, não fork (ADR-0002).
- **`affaan-m/ECC`** → inspiração de **gates de publicação** em e-commerce. Padrões de "draft → review → publish" que o agente `governance-risk-qa` replica.
- **`garrytan/gstack`** → inspiração de **práticas de stack**: estrutura de CI, env conventions, testing layout, dev DX. Não cobre governance especificamente, mas informa a camada operacional ao redor.

Nenhum deles clonado ainda. Bloqueia confirmação de padrões específicos — a política aqui é a melhor proposta baseada no que sabemos publicamente.

## Decisões em aberto

- [ ] Lint stack (eslint vs biome).
- [ ] Test runner (vitest é candidato default).
- [ ] Secret scan tool (`gitleaks` candidato).
- [ ] Dependency update bot (Dependabot vs Renovate).
- [ ] SAST tool (Semgrep candidato).
- [ ] DAST necessário para v1? (provável depois).
- [ ] Performance budget por agente — quem define baseline?
- [ ] Política de override humano em `block` — admin-app vai expor?

## Referências cruzadas

- [`security-overview.md`](./security-overview.md) — modelo de segurança macro.
- [`../adr/ADR-0002-upstream-policy.md`](../adr/ADR-0002-upstream-policy.md) — política de upstreams.
- [`../adr/ADR-0003-agent-layer-strategy.md`](../adr/ADR-0003-agent-layer-strategy.md) — guardrails enforced no runtime.
- [`../../10_ops/security/security-checklist.md`](../../10_ops/security/security-checklist.md) — checklist operacional.
- [`../../11_tests/README.md`](../../11_tests/README.md) — estratégia de testes.
- [`../../06_packages/guardrails/README.md`](../../06_packages/guardrails/README.md) — implementação dos guardrails.
- [`../../03_agents/governance-risk-qa/`](../../03_agents/governance-risk-qa/) — agente que aplica.
