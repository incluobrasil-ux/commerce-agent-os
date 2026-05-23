// shopify/webhooks/index.ts — contratos dos handlers de webhook.

import type { TenantId } from '@cao/shared-types';

export interface WebhookHandlerContext {
  readonly tenant: TenantId;
  readonly topic: string;
  readonly webhookId: string;
  readonly apiVersion: string;
}

export interface WebhookHandler<TPayload = unknown> {
  readonly topic: string;
  handle(payload: TPayload, ctx: WebhookHandlerContext): Promise<void>;
}

// Registry — implementação real vive em app/shopify.server.ts ou em adapter.
export interface WebhookRegistry {
  register(handler: WebhookHandler): void;
  dispatch(topic: string, payload: unknown, ctx: WebhookHandlerContext): Promise<void>;
}
