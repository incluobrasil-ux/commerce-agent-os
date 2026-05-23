// providers/yotpo/index.ts — stub.
// API docs: https://apidocs.yotpo.com/

import type { TenantId } from '@cao/shared-types';
import type { ReviewProvider } from '../../types/index.js';

export declare function makeYotpoProvider(tenant: TenantId): ReviewProvider;
