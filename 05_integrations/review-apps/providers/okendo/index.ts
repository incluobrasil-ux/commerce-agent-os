// providers/okendo/index.ts — stub.
// Docs: https://www.okendo.io/developers

import type { TenantId } from '@cao/shared-types';
import type { ReviewProvider } from '../../types/index.js';

export declare function makeOkendoProvider(tenant: TenantId): ReviewProvider;
