// higgsfield/types/index.ts — tipos provisórios.
// Confirmar com os upstreams quando clonados.

import type { TenantId } from '@cao/shared-types';

export type { TenantId };

// SkillId formato preliminar: "<namespace>/<name>@<version>", ex.: "marketing/icp-extract@1.2.0"
export type SkillId = string & { readonly __brand: 'SkillId' };

// Manifest de skill (inferido — confirmar):
export interface SkillManifest {
  id: SkillId;
  description: string;
  inputsSchema: unknown;   // JSON Schema ou zod-like; confirmar
  outputSchema: unknown;
  tags: string[];
  runtime: 'js' | 'python' | 'unknown';  // confirmar
  modelDefault?: string;
}

export interface SkillExecutionInput {
  skillId: SkillId;
  tenant: TenantId;
  vars: Record<string, unknown>;
  budget_usd?: number;
}

export interface SkillExecutionResult {
  ok: boolean;
  output?: unknown;
  error?: { code: string; message: string };
  provenance: {
    model?: string;
    cost_usd: number;
    duration_ms: number;
  };
}
