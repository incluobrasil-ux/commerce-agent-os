# higgsfield/client/

Client que abstrai descoberta e execução de skills.

## API prevista (provisória)

```ts
import type { TenantId } from '@cao/shared-types';
import type { SkillId, SkillManifest, SkillExecutionInput, SkillExecutionResult } from '../types/index.js';

export interface HiggsfieldClient {
  listSkills(opts?: { tag?: string }): Promise<SkillManifest[]>;
  getManifest(id: SkillId): Promise<SkillManifest>;
  execute(input: SkillExecutionInput): Promise<SkillExecutionResult>;
}

export declare function makeClient(tenant: TenantId): HiggsfieldClient;
```

## Garantias

- `tenant` no contexto de toda execução; cost tracking em `@cao/observability`.
- Erros normalizados em `errors/`.
- Sem fallback para sandbox arbitrário — execução respeita policy do tenant.

## Notas

A escolha entre HTTP registry, leitura local do clone em `01_upstreams/higgsfield-skills/`, ou invocação via CLI subprocess depende do que descobrirmos ao clonar. ADR a escrever.

## Status

Stub.
