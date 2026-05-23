# posthog/client/

Init server-side e web-side com tenant tagging + scrub + validação contra taxonomia.

## API prevista

```ts
import type { TenantId } from '@cao/shared-types';

export interface PostHogClient {
  capture(input: CaptureInput): void;
  identify(input: Identity): void;
  featureFlag(key: string): Promise<FlagPayload>;
  hogQL<T>(template: string, vars: Record<string, unknown>): Promise<HogQLResult<T>>;
  flush(): Promise<void>;
  shutdown(): Promise<void>;
}

export function makeServerClient(tenant: TenantId): PostHogClient;
export function makeWebClient(tenant: TenantId): PostHogClient;
```

## Garantias

- `tenant_id` adicionado a todo evento (não esquecível).
- Validação de `event` e `properties` contra taxonomia em `development` e `staging` (em prod: warn-only para não derrubar prod por desvio).
- PII scrub via `@cao/guardrails` em propriedades.
- Server-client usa `posthog-node` com batching; web usa `posthog-js`.
- HogQL queries só no server (Personal API Key não vai para o browser).

## Status

Stub.
