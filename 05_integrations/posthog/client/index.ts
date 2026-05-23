// posthog/client/index.ts — contratos do client.

import type { TenantId } from '@cao/shared-types';
import type {
  CaptureInput,
  Identity,
  FlagPayload,
  HogQLResult,
} from '../types/index.js';

export interface PostHogClient {
  capture(input: CaptureInput): void;
  identify(input: Identity): void;
  featureFlag(key: string): Promise<FlagPayload>;
  hogQL<T>(template: string, vars: Record<string, unknown>): Promise<HogQLResult<T>>;
  flush(): Promise<void>;
  shutdown(): Promise<void>;
}

export declare function makeServerClient(tenant: TenantId): PostHogClient;
export declare function makeWebClient(tenant: TenantId): PostHogClient;
