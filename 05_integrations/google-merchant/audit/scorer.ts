// Scorer — converte feed row + warnings + validação em SKU-level audit findings
// com severidade e remediação concreta. Pure functions, sem I/O.
//
// Modelo:
//   - Cada finding tem severity (critical | high | medium | low).
//   - Pontuação: 100 - penalidades. Floor em 0.
//   - Risk band: 80-100 green, 50-79 yellow, 0-49 red.
//
// Findings críticos são os que a Google Merchant rejeita (campo obrigatório
// ausente, URL inválida, preço inválido). Severidades menores são qualidade
// de feed (título sem brand, descrição curta, sem GTIN, etc.).

import type { FeedRow, ValidationResult } from '../client/feed-row.js';

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type RiskBand = 'green' | 'yellow' | 'red';

export interface Finding {
  code: string;
  severity: Severity;
  field: string;
  message: string;
  remediation: string;
}

export interface RowScore {
  offerId: string;
  title: string;
  score: number;
  band: RiskBand;
  findings: Finding[];
}

export interface AuditSummary {
  totalRows: number;
  averageScore: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  bySeverity: Record<Severity, number>;
  topFindings: Array<{ code: string; count: number; severity: Severity }>;
}

const PENALTY: Record<Severity, number> = {
  critical: 40,
  high: 20,
  medium: 8,
  low: 3,
};

const HIGH_RISK_KEYWORDS = [
  // marketing claims que a GMC frequentemente rejeita / pede comprovação
  'guaranteed',
  'cure',
  'miracle',
  'best in the world',
  'free shipping forever',
  '100% guaranteed',
  'sem risco',
  'cura',
  'milagre',
  'melhor do mundo',
];

// Claims terapêuticos/clínicos que disparam revisão ANVISA/CONAR/CDC no Brasil
// e reprovam direto no GMC quando associados a produto não-médico (RDC 204/2017,
// Lei 12.764/2012, CDC art. 37). Descoberto no audit Incluo 2026-05-26 — handles
// públicos ainda carregavam estes termos mesmo após titles serem reescritos.
//
// Estes termos são checados separadamente em campos onde aparecem com mais
// frequência (URL/link), pois o handle público vira parte do landing URL
// submetido ao GMC.
const THERAPEUTIC_CLAIM_KEYWORDS = [
  'autismo',
  'autista',
  'tea',
  'tdah',
  'adhd',
  'ocd',
  'asperger',
  'ansiedade',
  'depressao',
  'depressão',
  'anti-depressao',
  'anti-depressão',
  'alivia',
  'alívio',
  'alivio',
  'terapeutico',
  'terapêutico',
  'autorregulacao sensorial',
  'autorregulação sensorial',
  'sensorial integrativ',
];

const PLACEHOLDER_IMAGE_HINTS = [
  'placeholder',
  '.jpg.placeholder',
  // padrão gerado pelo transformer quando imageUrl ausente
];

/**
 * GMC category overrides — ajustes de severidade por categoria GMC.
 * Para categorias onde GTIN é frequentemente indisponível (ex.: brinquedos
 * educacionais artesanais), rebaixar severity de `gtin:missing` evita
 * falsos positivos uniformes que afundam o score do catálogo inteiro.
 *
 * Descoberto no N26 (audit real Incluo, 2026-05-25): 50/50 SKUs sem GTIN
 * em catálogo de brinquedos sensoriais — `medium` global penalizava demais.
 */
const GMC_CATEGORY_OVERRIDES: Record<string, { gtinSeverity?: Severity }> = {
  '3793': { gtinSeverity: 'low' }, // Toys & Games > Toys > Educational Toys
};

export interface ScoreInput {
  row: FeedRow;
  validation: ValidationResult;
  warnings: string[];
}

export function scoreRow(input: ScoreInput): RowScore {
  const findings: Finding[] = [];

  for (const err of input.validation.errors) {
    findings.push({
      code: `validation:${err.path || 'root'}`,
      severity: 'critical',
      field: err.path || '(root)',
      message: err.message,
      remediation: remediationForValidation(err.path, err.message),
    });
  }

  for (const w of input.warnings) {
    const f = mapWarning(w);
    if (f) findings.push(f);
  }

  findings.push(...semanticChecks(input.row));

  const totalPenalty = findings.reduce((acc, f) => acc + PENALTY[f.severity], 0);
  const score = Math.max(0, 100 - totalPenalty);
  const band: RiskBand = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red';

  return {
    offerId: input.row.offerId,
    title: input.row.title,
    score,
    band,
    findings,
  };
}

export function summarizeAudit(rowScores: RowScore[]): AuditSummary {
  const totalRows = rowScores.length;
  if (totalRows === 0) {
    return {
      totalRows: 0,
      averageScore: 0,
      greenCount: 0,
      yellowCount: 0,
      redCount: 0,
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      topFindings: [],
    };
  }
  const sum = rowScores.reduce((acc, r) => acc + r.score, 0);
  const averageScore = Math.round((sum / totalRows) * 10) / 10;

  let greenCount = 0;
  let yellowCount = 0;
  let redCount = 0;
  for (const r of rowScores) {
    if (r.band === 'green') greenCount++;
    else if (r.band === 'yellow') yellowCount++;
    else redCount++;
  }

  const bySeverity: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const codeCount = new Map<string, { count: number; severity: Severity }>();
  for (const r of rowScores) {
    for (const f of r.findings) {
      bySeverity[f.severity]++;
      const e = codeCount.get(f.code);
      if (e) e.count++;
      else codeCount.set(f.code, { count: 1, severity: f.severity });
    }
  }
  const topFindings = [...codeCount.entries()]
    .map(([code, v]) => ({ code, count: v.count, severity: v.severity }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return { totalRows, averageScore, greenCount, yellowCount, redCount, bySeverity, topFindings };
}

// ===== mapeamentos =====

function remediationForValidation(path: string, message: string): string {
  if (path === 'title') return 'Truncar título para ≤ 150 caracteres (limite Google Merchant).';
  if (path === 'description')
    return 'Preencher description com 1-5000 chars contendo specs do produto.';
  if (path === 'price.amount')
    return 'price.amount deve ser > 0 — Google rejeita 0. Sincronizar com Shopify.';
  if (path === 'price.currencyCode')
    return 'currencyCode deve ser ISO 4217 (3 letras, ex.: USD, BRL).';
  if (path === 'link' || path === 'imageLink')
    return `${path} deve ser URL absoluta (https://...).`;
  return `Validation falhou em \`${path}\`: ${message}.`;
}

function mapWarning(w: string): Finding | null {
  if (/descrição derivada do title/i.test(w)) {
    return {
      code: 'description:derived-from-title',
      severity: 'medium',
      field: 'description',
      message: 'Description derivada do title — Google penaliza thin content.',
      remediation:
        'Preencher description no Shopify com especificações reais (material, dimensão, uso).',
    };
  }
  if (/imageLink usou defaultImageUrl/i.test(w)) {
    return {
      code: 'imageLink:default-placeholder',
      severity: 'high',
      field: 'imageLink',
      message: 'imageLink veio do defaultImageUrl genérico — não passa em revisão GMC.',
      remediation:
        'Subir imagem real do produto no Shopify (≥ 250x250, fundo limpo, sem watermark).',
    };
  }
  if (/imageLink placeholder gerado/i.test(w)) {
    return {
      code: 'imageLink:generated-placeholder',
      severity: 'critical',
      field: 'imageLink',
      message:
        'imageLink gerado como placeholder a partir do handle — URL provavelmente não existe.',
      remediation: 'Produto sem imagem no Shopify; subir imagem real antes de submeter ao GMC.',
    };
  }
  if (/availability derivada do status/i.test(w)) {
    return {
      code: 'availability:derived-from-status',
      severity: 'low',
      field: 'availability',
      message: 'availability inferida do status Shopify (não do inventário real).',
      remediation: 'Conectar com inventory_quantity do Shopify para availability fiel.',
    };
  }
  if (/price ausente.*defaultPrice/i.test(w)) {
    return {
      code: 'price:used-default',
      severity: 'high',
      field: 'price',
      message: 'price preenchido com defaultPrice — não reflete o preço real.',
      remediation: 'Sincronizar preço via variant.price do Shopify antes de submeter.',
    };
  }
  if (/price ausente — row vai falhar/i.test(w)) {
    return {
      code: 'price:missing',
      severity: 'critical',
      field: 'price',
      message: 'price ausente — row vai falhar validação.',
      remediation: 'Definir variant.price no Shopify; sem preço o item não pode ser submetido.',
    };
  }
  if (/imageLink vazio.*Google Merchant exige/i.test(w)) {
    return {
      code: 'imageLink:empty',
      severity: 'critical',
      field: 'imageLink',
      message: 'imageLink vazio — Google Merchant exige URL de imagem.',
      remediation: 'Subir imagem real do produto no Shopify ou configurar defaultImageUrl.',
    };
  }
  return {
    code: 'warning:unmapped',
    severity: 'low',
    field: '(geral)',
    message: w,
    remediation: 'Revisar warning manualmente; mapeamento de remediação não disponível.',
  };
}

function semanticChecks(row: FeedRow): Finding[] {
  const out: Finding[] = [];

  // Missing brand
  if (!row.brand || row.brand.trim() === '') {
    out.push({
      code: 'brand:missing',
      severity: 'medium',
      field: 'brand',
      message: 'brand ausente — GMC trata como item genérico, reduz match para queries de marca.',
      remediation: 'Preencher Vendor no Shopify ou metafield específico mapeado para brand.',
    });
  }

  // Missing GTIN — severity ajustável por categoria GMC. Gap descoberto no N26
  // (audit real Incluo): brinquedos educacionais raramente têm GTIN, tratar como
  // medium uniforme afunda o score injustamente.
  if (!row.gtin || row.gtin.trim() === '') {
    const override = row.googleProductCategory
      ? GMC_CATEGORY_OVERRIDES[row.googleProductCategory]
      : undefined;
    const severity: Severity = override?.gtinSeverity ?? 'medium';
    out.push({
      code: 'gtin:missing',
      severity,
      field: 'gtin',
      message:
        'GTIN ausente — categorias com identifier_exists=true (ex.: eletrônicos) podem ser rejeitadas.',
      remediation:
        'Adicionar GTIN/UPC/EAN via metafield Shopify; se não aplicável, marcar identifier_exists=false.',
    });
  }

  // Missing MPN
  if (!row.mpn || row.mpn.trim() === '') {
    out.push({
      code: 'mpn:missing',
      severity: 'low',
      field: 'mpn',
      message: 'MPN ausente — quando GTIN também não existe, GMC pode penalizar.',
      remediation: 'Adicionar SKU/MPN como metafield Shopify.',
    });
  }

  // Missing googleProductCategory
  if (!row.googleProductCategory || row.googleProductCategory.trim() === '') {
    out.push({
      code: 'googleProductCategory:missing',
      severity: 'medium',
      field: 'googleProductCategory',
      message: 'googleProductCategory ausente — taxonomia GMC ajuda matching e CPC.',
      remediation:
        'Mapear productType Shopify → Google Product Taxonomy via `gmcCategoryByProductType` ou ' +
        'setar `defaultGmcCategoryId` no TransformOptions.',
    });
  }

  // Title:no-brand — fires sempre que brand está populado mas não aparece no título.
  // (Era condicionado a titleLen > 70; gap descoberto no N26 — títulos curtos também
  // se beneficiam de prefixar com brand para recall + matching GMC.)
  if (row.brand && !row.title.toLowerCase().includes(row.brand.toLowerCase())) {
    out.push({
      code: 'title:no-brand',
      severity: 'low',
      field: 'title',
      message: 'Title não contém brand — boa prática inclui no início.',
      remediation: `Adicionar "${row.brand}" no início do title.`,
    });
  }

  // Title quality (length)
  const titleLen = row.title.length;
  if (titleLen < 20) {
    out.push({
      code: 'title:too-short',
      severity: 'medium',
      field: 'title',
      message: `Title curto (${titleLen} chars) — GMC favorece títulos de 70-150 chars informativos.`,
      remediation: 'Expandir título: marca + nome + atributo chave (cor/tamanho/material).',
    });
  }

  // Description quality — descoberto no N26 que MCP search_products retorna
  // descrições truncadas em "...". Não penalizar como thin content; flagar como
  // `description:truncated` (low) para verificação manual.
  const descLen = row.description.length;
  const isTruncated = row.description.endsWith('...') || row.description.endsWith('…');
  if (descLen < 100) {
    if (isTruncated) {
      out.push({
        code: 'description:truncated',
        severity: 'low',
        field: 'description',
        message: `Description curta (${descLen} chars) e termina em "..." — provavelmente truncada na fonte.`,
        remediation:
          'Conteúdo real pode estar OK no Shopify. Verificar via admin antes de assumir thin content.',
      });
    } else {
      out.push({
        code: 'description:too-short',
        severity: 'medium',
        field: 'description',
        message: `Description curta (${descLen} chars) — thin content penaliza.`,
        remediation: 'Mínimo recomendado: 200-500 chars com specs, uso e diferencial.',
      });
    }
  }

  // High-risk keywords in title/description
  const haystack = `${row.title} ${row.description}`.toLowerCase();
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (haystack.includes(kw.toLowerCase())) {
      out.push({
        code: `claim:risk-keyword:${kw.replace(/\s+/g, '-')}`,
        severity: 'high',
        field: 'title/description',
        message: `Termo "${kw}" pode disparar revisão por claim sem comprovação.`,
        remediation:
          'Remover ou substituir por linguagem comprovável (com dado / spec / certificação).',
      });
      break; // 1 keyword finding por row é suficiente
    }
  }

  // Therapeutic claims em title/description (regra separada — severidade high,
  // mas o conjunto de keywords é distinto e o motivo regulatório é específico:
  // ANVISA/CONAR/CDC art. 37 + Lei 12.764/2012 para produtos não-médicos).
  const therapeuticHit = THERAPEUTIC_CLAIM_KEYWORDS.find((kw) =>
    haystack.includes(kw.toLowerCase()),
  );
  if (therapeuticHit) {
    out.push({
      code: `claim:therapeutic:${therapeuticHit.replace(/\s+/g, '-')}`,
      severity: 'high',
      field: 'title/description',
      message: `Termo terapêutico "${therapeuticHit}" associa produto não-médico a condição clínica — risco ANVISA/CONAR/CDC art. 37.`,
      remediation:
        'Substituir por descrição lúdica/educativa neutra. Para manter associação a condição clínica, requer registro ANVISA + parecer jurídico-sanitário.',
    });
  }

  // Therapeutic claims em link (URL pública). O handle vira parte do landing
  // URL submetido ao GMC; mesmo com title limpo, claim no slug reprova.
  // Descoberto no audit Incluo 2026-05-26: handles tipo
  // `12-lados-fidget-cubo-...-alivia-o-estresse-...-anti-depressao-...-tdah-...-ocd-autismo`
  // após titles terem sido reescritos para versão limpa.
  const linkLc = row.link.toLowerCase();
  const linkHit = THERAPEUTIC_CLAIM_KEYWORDS.find((kw) => linkLc.includes(kw.toLowerCase()));
  if (linkHit) {
    out.push({
      code: `link:therapeutic-claim:${linkHit.replace(/\s+/g, '-')}`,
      severity: 'high',
      field: 'link',
      message: `URL/handle contém termo terapêutico "${linkHit}" — Google ingere a URL como landing page, dispara revisão mesmo com title limpo.`,
      remediation:
        'Reescrever handle no Shopify Admin → Search Engine Listing → URL. Shopify cria redirect 301 automaticamente.',
    });
  }

  // Placeholder image
  if (PLACEHOLDER_IMAGE_HINTS.some((h) => row.imageLink.toLowerCase().includes(h))) {
    out.push({
      code: 'imageLink:placeholder-detected',
      severity: 'high',
      field: 'imageLink',
      message: 'imageLink parece placeholder — alta chance de disapproval.',
      remediation: 'Subir imagem real do produto.',
    });
  }

  return out;
}
