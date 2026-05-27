// Legal-profile loader — auto-discovery do `legal-profile.json` no vault.
//
// Convenção de path (alinhada com brain-bridge.resolveBrainDir):
//   tenants/<tenantId>/stores/<storeId>/legal-profile.json   ← store-level
//   tenants/<tenantId>/legal-profile.json                    ← tenant-fallback
//
// O Chefe tenta store primeiro; se não achar, cai no tenant. Retorna null se
// nenhum existir — caller decide se carrega via --legal-profile= ou bloqueia.

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { StoreLegalProfile } from './legal.js';

export interface LegalLoaderInput {
  /** Raiz do vault — geralmente `07_memory/vault`. */
  vaultRoot: string;
  tenantId: string;
  storeId?: string;
}

/**
 * Tenta carregar legal-profile do vault, primeiro store-level, depois tenant.
 * Retorna null se nenhum arquivo existir (sem throw).
 */
export async function loadLegalProfileFromVault(
  input: LegalLoaderInput,
): Promise<StoreLegalProfile | null> {
  const candidates: string[] = [];
  if (input.storeId) {
    candidates.push(
      resolve(
        input.vaultRoot,
        'tenants',
        input.tenantId,
        'stores',
        input.storeId,
        'legal-profile.json',
      ),
    );
  }
  candidates.push(resolve(input.vaultRoot, 'tenants', input.tenantId, 'legal-profile.json'));

  for (const path of candidates) {
    try {
      const content = await fs.readFile(path, 'utf8');
      return JSON.parse(content) as StoreLegalProfile;
    } catch {
      // continua para o próximo candidato
    }
  }
  return null;
}

/**
 * Resolve qual path seria carregado (sem ler), útil para diagnóstico/CLI.
 */
export function legalProfilePathFor(input: LegalLoaderInput): string {
  if (input.storeId) {
    return resolve(
      input.vaultRoot,
      'tenants',
      input.tenantId,
      'stores',
      input.storeId,
      'legal-profile.json',
    );
  }
  return resolve(input.vaultRoot, 'tenants', input.tenantId, 'legal-profile.json');
}
