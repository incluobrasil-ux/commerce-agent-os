// posthog/types/index.ts — tipos do adapter.

import type { TenantId } from '@cao/shared-types';

export type { TenantId };

// Naming de evento: <surface>.<verb>. Lista canônica em events-taxonomy.yaml.
// Quando implementar, gerar este union a partir do YAML.
export type EventName = string & { readonly __brand: 'PostHogEventName' };

// Propriedades comuns injetadas automaticamente pelo adapter.
export interface CommonProperties {
  tenant_id: TenantId;
  env: 'development' | 'staging' | 'production';
  app: string;
  app_version?: string;
}

// Payload genérico — implementação real terá overloads por EventName.
export interface CaptureInput {
  event: EventName;
  properties?: Record<string, unknown>;
  distinctId?: string;
  timestamp?: string;
}

export interface Identity {
  distinctId: string;
  properties?: Record<string, unknown>;
  // PII proibido — adapter rejeita campos em forbidden list.
}

export interface FlagPayload {
  key: string;
  value: boolean | string;
  variant?: string;
}

export interface HogQLResult<T = unknown> {
  rows: T[];
  rowCount: number;
  hasMore: boolean;
}
