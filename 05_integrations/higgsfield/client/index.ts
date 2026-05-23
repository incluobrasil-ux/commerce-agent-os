// higgsfield/client/index.ts — contratos do client (provisório).

import type { TenantId } from '@cao/shared-types';
import type {
  SkillExecutionInput,
  SkillExecutionResult,
  SkillId,
  SkillManifest,
} from '../types/index.js';

export interface HiggsfieldClient {
  listSkills(opts?: { tag?: string }): Promise<SkillManifest[]>;
  getManifest(id: SkillId): Promise<SkillManifest>;
  execute(input: SkillExecutionInput): Promise<SkillExecutionResult>;
}

export declare function makeClient(tenant: TenantId): HiggsfieldClient;
