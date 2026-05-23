// higgsfield/client/index.ts — contratos do client (provisório).

import type { TenantId } from '@cao/shared-types';
import type {
  SkillId,
  SkillManifest,
  SkillExecutionInput,
  SkillExecutionResult,
} from '../types/index.js';

export interface HiggsfieldClient {
  listSkills(opts?: { tag?: string }): Promise<SkillManifest[]>;
  getManifest(id: SkillId): Promise<SkillManifest>;
  execute(input: SkillExecutionInput): Promise<SkillExecutionResult>;
}

export declare function makeClient(tenant: TenantId): HiggsfieldClient;
