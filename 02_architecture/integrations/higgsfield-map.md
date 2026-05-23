# Higgsfield integration map

Mapa detalhado de **como Higgsfield Skills + CLI entram no commerce-agent-os**.

> **Atenção:** schema/formato real de Skills + CLI da Higgsfield **não foi inspecionado** ainda (upstreams não clonados). Este documento é uma **proposta arquitetural baseada na premissa de "skills como unidades declarativas com manifest"**. Revisar e ajustar após Fase 6.

## Duas superfícies, dois consumidores

| Superfície | Consumidor primário | Localização autoral |
|---|---|---|
| **Skills (runtime)** — invocar skill como tool durante run | `06_packages/skills` (registry) + agentes via `@cao/runtime` | `05_integrations/higgsfield/client/` |
| **CLI (dev/ops)** — descobrir/instalar/atualizar skills | desenvolvedor / CI | `10_ops/higgsfield-cli/` (wrappers shell) |

Separação é importante: **runtime** roda em produção e precisa ser previsível/auditável; **CLI** é ferramenta de dev e não tem garantia de estabilidade equivalente.

## Skills runtime — fluxo de uso

```
[agente declara tool em tools.yaml]
   ex.: copy/headline-variants
       │
       ▼
[@cao/runtime ao montar agente]
   resolve tool name → @cao/skills/<name>
       │
       ▼
[@cao/skills.invoke(name, vars)]
   ├── implementação local (preferida quando disponível)
   └── proxy para Higgsfield via 05_integrations/higgsfield/client.execute()
       │
       ▼
[Higgsfield client]
   ├── consulta manifest (cache local)
   ├── valida vars contra inputsSchema
   ├── executa (HTTP / CLI / local — a confirmar)
   └── retorna SkillExecutionResult com provenance
       │
       ▼
[result + provenance volta para agente via runtime]
[audit_log via @cao/observability — cost + duration por skill]
```

Princípio: agente **não sabe** se uma skill é Higgsfield ou local. `@cao/skills` decide. Isso permite migrar implementação sem mexer em agente.

## CLI dev/ops — fluxo de uso

```
[dev quer atualizar catálogo local]
   bash 10_ops/higgsfield-cli/sync.sh
       │
       ▼
[shell script invoca higgsfield CLI]
   higgsfield search --tag copy
   higgsfield install copy/headline-variants@1.2.0
       │
       ▼
[skill instalada localmente (cache em ~/.cache/higgsfield ou similar)]
       │
       ▼
[@cao/skills detecta presença via probe local]
```

A CLI **não** roda em produção — só em dev e CI para keep-in-sync.

## Catálogo de skills selecionadas

Decisão de quais skills usar é **declarativa** em [`05_integrations/higgsfield/skills-catalog.yaml`](../../05_integrations/higgsfield/skills-catalog.yaml). Não importamos em bloco — cherry-pick conforme necessidade dos agentes.

Skills planejadas (provisório, a confirmar com upstream):

| Categoria | Skills relevantes | Consumidor |
|---|---|---|
| Marketing | `marketing/icp-extract`, `marketing/positioning-framework` | `marketing-director`, `product-offer` |
| Copy | `copy/headline-variants`, `copy/cta-microcopy`, `copy/email-subject-line` | `creative-copy-assets`, `design-ux-localization` |
| E-commerce | `ecommerce/title-rewrite-pdp`, `ecommerce/attribute-fill` | `product-feed-seo`, `merchant-compliance` |
| Research | `research/theme-clustering` | `reviews-ops` |

## Relação com `@cao/skills`

`@cao/skills` é o **registry interno autoral**. Ele:
- Mantém implementações **locais** de algumas skills (TS-nativo, mais rápido, mais customizável).
- Proxia outras para Higgsfield via este adapter.
- Apresenta uma interface única para o `@cao/runtime`.

Critério de decisão "local vs Higgsfield":
- **Local** quando: skill é central ao domínio, precisa ser muito customizada por tenant, precisa de baixa latência, precisa de auditoria fina.
- **Higgsfield** quando: skill é commoditizada (headline variants, generic copy), atualização frequente da comunidade, baixo custo de delegar.

Convenção: skill que vira local primeiro é candidata a contribuir de volta a um upstream quando viável.

## Auth e segurança

- `HIGGSFIELD_API_KEY` se houver registry HTTP autenticado (a confirmar).
- CLI usa config local; em CI, secret via env var.
- Skills executam **dentro do nosso runtime** — não em sandbox arbitrário do Higgsfield. Isso preserva enforcement de `@cao/guardrails`.
- Cost tracking por skill: sempre via `@cao/observability` independente de provider.

## Versionamento

- Skill id inclui versão: `copy/headline-variants@1.2.0`.
- Pin de versão obrigatório em `skills-catalog.yaml`.
- Update de versão é PR consciente.
- Breaking change na skill → ADR.

## Política de uso

- **Nunca** invocar skill arbitrária (não catalogada) — `@cao/skills` rejeita.
- Toda invocação registra audit (skill id, vars hash, cost, duration, tenant).
- Failure de skill é **terminal por padrão** — não retry automático (custo).
- Skill execution budget é parte do `policy` do agente.

## Riscos

| Risco | Mitigação |
|---|---|
| Formato Higgsfield muda (breaking) | pin de versão; ADR por update; abstração via `@cao/skills` isola agentes |
| Skill de terceiros tem comportamento inesperado | guardrails de output do runtime + audit log |
| Latência de skill remota | medir via `@cao/observability`; mover para local quando justificável |
| Cost imprevisível | budget por execução; budget agregado por agente |
| Higgsfield CLI quebra workflow dev | wrappers idempotentes; CI testa caminho sem-Higgsfield como fallback |

## Decisões em aberto

- [ ] Esquema real do manifest de skill (confirmar com upstream).
- [ ] Existe registry HTTP ou tudo via CLI?
- [ ] Auth (API key? OAuth? local config?).
- [ ] Modelo de execução (HTTP? subprocess CLI? eval direto?).
- [ ] Sandboxing — confiamos no executor da Higgsfield ou rodamos dentro do nosso runtime?
- [ ] Estratégia de cache de manifest.
- [ ] Como propagar `tenant_id` para skill (alguma skill precisa? maioria provavelmente não).

## Referências cruzadas

- [`05_integrations/higgsfield/README.md`](../../05_integrations/higgsfield/README.md)
- [`05_integrations/higgsfield/skills-catalog.yaml`](../../05_integrations/higgsfield/skills-catalog.yaml)
- [`06_packages/skills/README.md`](../../06_packages/skills/README.md) — registry interno
- [`12_reports/benchmarks/marketing-creative-stack.md`](../../12_reports/benchmarks/marketing-creative-stack.md) — comparativo das fontes de skills
