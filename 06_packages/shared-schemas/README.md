# @cao/shared-schemas

Schemas **runtime** que espelham os tipos de `@cao/shared-types`. Validação no boundary (HTTP, fila, DB, LLM, FS).

## Por que existe separado

- `@cao/shared-types` é zero-runtime.
- Quando dado entra no sistema (boundary), tem que ser **validado**. Schemas vivem aqui.
- Separar permite usar `shared-types` sem puxar zod em consumidores que só precisam de tipo.

## Stack preferida

- **zod** por padrão (a confirmar em ADR-0006 ainda não escrito).
- Cada schema exporta `Schema` (a forma zod) e re-exporta o tipo inferido para conveniência:
  ```ts
  export const ProductEventSchema = z.object({ ... });
  export type ProductEvent = z.infer<typeof ProductEventSchema>;
  ```
  Mas o tipo canônico permanece em `@cao/shared-types` — schema serve para parsear, não para definir.

## Regras

- Schema runtime **só valida** — não transforma de forma destrutiva.
- Mensagens de erro em inglês, descritivas (entram em logs).
- Nenhuma chamada de rede.
- Composição via `.merge`, `.extend`, `.pick`.

## Consumido por

- Adapters em `05_integrations/` (parse de payloads externos).
- `@cao/runtime` (validação de input/output de tools e agentes).
- `@cao/guardrails` (esquema de policies).
- Apps em `04_apps/` (validação de payloads HTTP).

## Status

Stub. Implementação real começa na Fase 5/7.
