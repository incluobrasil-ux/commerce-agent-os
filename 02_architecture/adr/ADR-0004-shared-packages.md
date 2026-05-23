# ADR-0004 — Packages compartilhados (shared-types / shared-schemas / shared-config)

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —

## Contexto

Após Fase 3a/b, temos `@cao/core` (utilidades runtime + tipos básicos) e `@cao/config` (loader de env). Conforme avançamos para Fase 4–5, surgem três pressões distintas:

1. **Tipos canônicos do domínio** (`ProductEvent`, `CreativeBrief`, `AgentAuditEntry`, etc.) precisam ser usados por **todos** os packages sem custo runtime. Misturá-los no `@cao/core` força `core` a virar gigante e dificulta tree-shaking.
2. **Schemas runtime** (zod) precisam existir para validar dados no boundary, mas não devem se confundir com tipos type-time, e não devem ser obrigatórios em consumidores que só importam tipo.
3. **Nomes/Schemas de configuração** (env vars, feature flags) são referenciados em adapters, apps e docs. Mantê-los só em `@cao/config` cria dependência runtime onde só precisamos da constante.

## Decisão

Criar **três packages compartilhados** novos:

| Package | Conteúdo | Custo runtime |
|---|---|---|
| `@cao/shared-types` | `type`, `interface`, `enum const`, branded ids — apenas type-time | zero |
| `@cao/shared-schemas` | schemas runtime (zod) espelhando `shared-types`, usados no boundary | zod |
| `@cao/shared-config` | nomes canônicos de env vars, schemas de config/feature flags | zero ou mínimo |

**Relação com packages existentes:**

| Package existente | Continua responsável por | Não é mais responsável por |
|---|---|---|
| `@cao/core` | utilities runtime (clock, ids, retry, fs walk, idempotency keys), `BaseError` e subclasses | tipos canônicos do domínio (agora em `shared-types`) |
| `@cao/config` | **carregar e validar** env, defaults por ambiente, mascarar secrets em logs | **declarar** quais env vars existem (agora em `shared-config`) |

Convenção: nomes `@cao/shared-*` são reservados para "definição compartilhada que outros packages consomem". Nada com I/O ou estado vai em `shared-*`.

## Consequências

**Positivas**
- Consumidores de tipo (a maioria) não pagam custo runtime.
- Schemas ficam descobríveis em um lugar único.
- `core` e `config` viram menores e mais coesos.
- Adicionar novo tipo canônico vira PR isolado em `shared-types`.

**Negativas / trade-offs**
- Mais um package = mais um ponto de versionamento.
- Risco de pessoas porem util runtime em `shared-types` por engano → enforce via lint (Fase 5).

**Risco a monitorar**
- Duplicação acidental: tipo em `shared-types` e schema em `shared-schemas` precisam ser kept in sync. Mitigação: schema infere o tipo via `z.infer`, mas o **canônico** continua sendo `shared-types` — schema testa a forma; tipo manda na intenção.

## Pendências

- ~~Confirmar zod como stack (ADR-0006 ainda não escrito).~~ **Resolvido em [ADR-0006](./ADR-0006-qa-stack.md)** (aceito 2026-05-23): zod ^3 confirmado para `@cao/shared-schemas`.
- Lint rule para impedir `import` de I/O em `shared-*`.
