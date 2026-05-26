// @cao/integration-shopify/writeback — barrel.
//
// Loop fechado: compliance → parser → apply → audit → (opcional) productUpdate.
// Default é dry-run; --apply é gate explícito.

export * from './compliance-parser.js';
export * from './apply-revisions.js';
export * from './audit-log.js';
