# shopify/webhooks/

Roteamento de webhooks Shopify recebidos pelo `04_apps/shopify-admin-app`.

## Responsabilidades do adapter

1. **HMAC verify** — calcula HMAC-SHA256 do body raw com `SHOPIFY_API_SECRET` e compara com `X-Shopify-Hmac-Sha256`. Falha → `ShopifyWebhookHmacError`.
2. **Deduplicação** — chave: `X-Shopify-Webhook-Id`. Skip silencioso em retries Shopify (janela 24h).
3. **Parse** — valida payload com schema runtime de `@cao/shared-schemas` (zod).
4. **Routing** — despacha para handler do topic conforme `webhook-topics.yaml`.
5. **Audit log** — toda recepção (válida ou inválida) entra em audit.

## Handlers previstos

Espelham `webhook-topics.yaml`:

| Handler | Topic |
|---|---|
| `app-uninstalled` | `app/uninstalled` |
| `gdpr-shop-redact` | `shop/redact` |
| `gdpr-data-request` | `customers/data_request` |
| `gdpr-customer-redact` | `customers/redact` |
| `products-mutated` | `products/create`, `products/update` |
| `products-deleted` | `products/delete` |
| `orders-created` | `orders/create` (opt-in) |
| `orders-updated` | `orders/updated` (opt-in) |

## Contract de handler

```ts
import type { TenantId } from '@cao/shared-types';

export interface WebhookHandlerContext {
  tenant: TenantId;
  topic: string;
  webhookId: string;
  apiVersion: string;
}

export interface WebhookHandler<TPayload = unknown> {
  topic: string;
  handle(payload: TPayload, ctx: WebhookHandlerContext): Promise<void>;
}
```

Handler é **async + idempotente**. HTTP responde 200 imediatamente; handler enfileira em worker.

## Status

Stub. Apenas tipos do contract; nenhum handler implementado.
