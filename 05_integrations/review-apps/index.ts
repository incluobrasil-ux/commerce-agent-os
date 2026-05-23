// @cao/integration-review-apps — barrel + factory.

import type { TenantId } from '@cao/shared-types';
import type { ProviderName, ReviewProvider } from './types/index.js';

export * from './types/index.js';
export * from './errors/index.js';

// Factory — implementação real escolhe e instancia provider correto.
// Cada provider em ./providers/<name>/ exporta `make<Name>Provider(tenant)`.
export declare function makeProvider(tenant: TenantId, name: ProviderName): ReviewProvider;
