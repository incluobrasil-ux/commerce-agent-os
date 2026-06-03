// pre-review-validator — Checklist determinístico de pré-submissão ao GMC.
//
// Cobre todas as 20 superfícies identificadas no audit Incluo 2026-05-28
// que o scorer N20.2 não cobria (apenas FeedRow). Pure functions, sem I/O.
//
// Uso típico: chamar antes de recomendar "Request Review" no GMC.
// Input: dados brutos do Shopify (via GraphQL query ou fixture JSON).
// Output: PreReviewReport com Go/No-Go, lista de issues por superfície
// e checklist de todas as camadas auditadas.
//
// N20.3 — audit Incluo 2026-05-28.

// ===== Constantes (espelhadas do scorer para manter consistência) =====

const THERAPEUTIC_KEYWORDS = [
  'autismo', 'autista', 'tea', 'tdah', 'adhd', 'ocd', 'asperger',
  'ansiedade',
  'depressao', 'depressão', 'anti-depressao', 'anti-depressão',
  'alivia', 'alívio', 'alivio',
  'antiestresse', 'anti-estresse', 'antistress', 'anti-stress',
  'terapeutico', 'terapêutico',
  'terapeutas ocupacionais',
  'clinica aba',
  'autorregulacao', 'autorregulação',
  'regulacao emocional', 'regulação emocional',
  'integracao sensorial', 'integração sensorial',
  'sobrecarga sensorial',
];

function findClaim(text: string): string | null {
  const lc = text.toLowerCase();
  return THERAPEUTIC_KEYWORDS.find((kw) => lc.includes(kw)) ?? null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// ===== Input types =====

export interface PreReviewProduct {
  id: string;
  title: string;
  handle: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  descriptionHtml?: string | null;
  productType?: string | null;
  tags?: string[];
  vendor?: string | null;
  variants?: Array<{
    title?: string | null;
    price?: string | null;
    optionValues?: string[];
  }>;
  /** Alt text de cada imagem (string vazia = sem alt). */
  imageAlts?: string[];
  /** Conteúdo extraído do metafield custom.detalhes_do_produto. */
  detalhesDoProduct?: string | null;
}

export interface PreReviewCollection {
  id: string;
  title: string;
  handle: string;
  descriptionHtml?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface PreReviewArticle {
  id: string;
  title: string;
  /** Tags do artigo (ex.: ["Ansiedade", "Alívio do Estresse"]). */
  tags?: string[];
  /** Corpo do artigo — para checar links com handles antigos. */
  bodyHtml?: string | null;
  /** Handles terapêuticos que não devem mais aparecer em hrefs. */
  deprecatedHandles?: string[];
}

// ===== Output types =====

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface PreReviewIssue {
  /** Código único do issue (ex.: "product.seoTitle.therapeutic-claim"). */
  code: string;
  severity: IssueSeverity;
  /** Superfície GMC onde o issue foi encontrado. */
  surface: string;
  /** ID do objeto afetado (productId, collectionId, articleId). */
  entityId: string;
  /** Título/nome do objeto afetado. */
  entityTitle: string;
  /** Trecho exato com o problema. */
  excerpt: string;
  /** Termo problemático encontrado (se aplicável). */
  term?: string;
  /** O que fazer para resolver. */
  remediation: string;
}

export interface SurfaceStatus {
  surface: string;
  status: 'clean' | 'issues' | 'unchecked';
  issueCount: number;
}

export interface PreReviewReport {
  /** GO = nenhum blocker; NO-GO = ≥1 issue critical ou high. */
  verdict: 'GO' | 'NO-GO';
  blockerCount: number;
  warningCount: number;
  totalIssues: number;
  issues: PreReviewIssue[];
  /** Status por superfície — visão consolidada do checklist. */
  surfaceChecklist: SurfaceStatus[];
  /** Contagens por severidade. */
  bySeverity: Record<IssueSeverity, number>;
  /** Total de produtos/coleções/artigos inspecionados. */
  stats: {
    productsScanned: number;
    collectionsScanned: number;
    articlesScanned: number;
  };
}

// ===== Core validation =====

/**
 * Executa validação completa pré-review-GMC de forma determinística.
 * Nenhuma chamada de rede ou LLM — puro processamento de texto.
 */
export function runPreReviewValidation(
  products: PreReviewProduct[],
  collections: PreReviewCollection[],
  articles: PreReviewArticle[],
): PreReviewReport {
  const issues: PreReviewIssue[] = [];

  // ---- Produtos ----
  for (const p of products) {
    // 1. title
    const titleClaim = findClaim(p.title);
    if (titleClaim) {
      issues.push({
        code: 'product.title.therapeutic-claim',
        severity: 'high',
        surface: 'product.title',
        entityId: p.id,
        entityTitle: p.title,
        excerpt: p.title,
        term: titleClaim,
        remediation: `Substituir "${titleClaim}" por linguagem funcional/educativa.`,
      });
    }

    // 2. seoTitle
    if (p.seoTitle) {
      const c = findClaim(p.seoTitle);
      if (c) {
        issues.push({
          code: 'product.seoTitle.therapeutic-claim',
          severity: 'high',
          surface: 'product.seoTitle',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: p.seoTitle,
          term: c,
          remediation: 'Editar seo.title no Shopify Admin → Search Engine Listing.',
        });
      }
    }

    // 3. seoDescription
    if (p.seoDescription) {
      const c = findClaim(p.seoDescription);
      if (c) {
        issues.push({
          code: 'product.seoDescription.therapeutic-claim',
          severity: 'high',
          surface: 'product.seoDescription',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: p.seoDescription.slice(0, 120),
          term: c,
          remediation: 'Editar seo.description no Shopify Admin → Search Engine Listing.',
        });
      }
    }

    // 4. descriptionHtml (body)
    if (p.descriptionHtml) {
      const body = stripHtml(p.descriptionHtml);
      const c = findClaim(body);
      if (c) {
        const idx = body.toLowerCase().indexOf(c.toLowerCase());
        issues.push({
          code: 'product.description.therapeutic-claim',
          severity: 'high',
          surface: 'product.descriptionHtml',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: body.slice(Math.max(0, idx - 30), idx + c.length + 30),
          term: c,
          remediation: 'Editar descrição do produto no Shopify Admin → Produto → Descrição.',
        });
      }
    }

    // 5. productType
    if (p.productType && p.productType.trim() !== '') {
      const c = findClaim(p.productType);
      if (c) {
        issues.push({
          code: 'product.productType.therapeutic-claim',
          severity: 'high',
          surface: 'product.productType',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: p.productType,
          term: c,
          remediation: 'Editar Product Type no Shopify Admin → Produto → Organização.',
        });
      }
    }

    // 6. tags
    if (p.tags) {
      for (const tag of p.tags) {
        const c = findClaim(tag);
        if (c) {
          issues.push({
            code: 'product.tags.therapeutic-claim',
            severity: 'high',
            surface: 'product.tags',
            entityId: p.id,
            entityTitle: p.title,
            excerpt: tag,
            term: c,
            remediation: `Remover tag "${tag}" no Shopify Admin → Produto → Tags.`,
          });
          break; // 1 por produto
        }
      }
    }

    // 7. handle
    if (p.handle) {
      const c = findClaim(p.handle);
      if (c) {
        issues.push({
          code: 'product.handle.therapeutic-claim',
          severity: 'high',
          surface: 'product.handle',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: p.handle,
          term: c,
          remediation:
            'Editar handle no Shopify Admin → Produto → Search Engine Listing → URL. Shopify cria 301 automático.',
        });
      }
    }

    // 8. image alt texts
    if (p.imageAlts) {
      const emptyCount = p.imageAlts.filter((a) => !a || a.trim() === '').length;
      if (emptyCount > 0) {
        issues.push({
          code: 'product.imageAlt.empty',
          severity: 'medium',
          surface: 'product.media[].alt',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: `${emptyCount}/${p.imageAlts.length} imagens sem alt text`,
          remediation:
            'Preencher alt text via productUpdateMedia: "Produto X [cor/material] brinquedo sensorial [tátil/visual/fidget]".',
        });
      }
      const therapeuticAlt = p.imageAlts
        .filter((a) => a && a.trim() !== '')
        .map((a) => ({ a, c: findClaim(a) }))
        .find((x) => x.c !== null);
      if (therapeuticAlt?.c) {
        issues.push({
          code: 'product.imageAlt.therapeutic-claim',
          severity: 'high',
          surface: 'product.media[].alt',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: therapeuticAlt.a,
          term: therapeuticAlt.c,
          remediation: 'Substituir alt text terapêutico por descrição física neutra.',
        });
      }
    }

    // 9. metafield custom.detalhes_do_produto
    if (p.detalhesDoProduct && p.detalhesDoProduct.trim() !== '') {
      const body = stripHtml(p.detalhesDoProduct);
      const c = findClaim(body);
      if (c) {
        const idx = body.toLowerCase().indexOf(c.toLowerCase());
        issues.push({
          code: 'product.metafield.therapeutic-claim',
          severity: 'high',
          surface: 'product.custom.detalhes_do_produto',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: body.slice(Math.max(0, idx - 30), idx + c.length + 30),
          term: c,
          remediation:
            'Editar metafield custom.detalhes_do_produto via graphql_mutation productUpdate ou Shopify Admin → Produto → Metafields.',
        });
      }
    }

    // 10. variant prices (preço R$0,00)
    if (p.variants) {
      const zeroVariants = p.variants.filter(
        (v) => v.price !== null && v.price !== undefined && parseFloat(v.price) === 0,
      );
      if (zeroVariants.length > 0) {
        issues.push({
          code: 'product.variant.price-zero',
          severity: 'critical',
          surface: 'product.variants[].price',
          entityId: p.id,
          entityTitle: p.title,
          excerpt: `${zeroVariants.length} variante(s) com preço R$0,00`,
          remediation: 'Definir preço real nas variantes. GMC reprova produtos com price=0.',
        });
      }

      // variant option values
      for (const v of p.variants) {
        if (v.optionValues) {
          for (const opt of v.optionValues) {
            const c = findClaim(opt);
            if (c) {
              issues.push({
                code: 'product.variantOption.therapeutic-claim',
                severity: 'high',
                surface: 'product.variants[].options',
                entityId: p.id,
                entityTitle: p.title,
                excerpt: opt,
                term: c,
                remediation: `Editar option value "${opt}" no Shopify Admin → Produto → Variantes.`,
              });
              break;
            }
          }
        }
      }
    }
  }

  // ---- Coleções ----
  for (const col of collections) {
    // 11. collection handle
    const hc = findClaim(col.handle);
    if (hc) {
      issues.push({
        code: 'collection.handle.therapeutic-claim',
        severity: 'high',
        surface: 'collection.handle',
        entityId: col.id,
        entityTitle: col.title,
        excerpt: col.handle,
        term: hc,
        remediation:
          'Editar handle da coleção no Shopify Admin → Coleção → Search Engine Listing. Shopify cria 301 automático.',
      });
    }

    // 12. collection descriptionHtml
    if (col.descriptionHtml) {
      const body = stripHtml(col.descriptionHtml);
      const c = findClaim(body);
      if (c) {
        const idx = body.toLowerCase().indexOf(c.toLowerCase());
        issues.push({
          code: 'collection.description.therapeutic-claim',
          severity: 'high',
          surface: 'collection.descriptionHtml',
          entityId: col.id,
          entityTitle: col.title,
          excerpt: body.slice(Math.max(0, idx - 30), idx + c.length + 30),
          term: c,
          remediation: 'Editar descrição da coleção via collectionUpdate GraphQL mutation.',
        });
      }
    }

    // 13. collection seoTitle
    if (col.seoTitle) {
      const c = findClaim(col.seoTitle);
      if (c) {
        issues.push({
          code: 'collection.seoTitle.therapeutic-claim',
          severity: 'high',
          surface: 'collection.seoTitle',
          entityId: col.id,
          entityTitle: col.title,
          excerpt: col.seoTitle,
          term: c,
          remediation: 'Editar seo.title da coleção via collectionUpdate.',
        });
      }
    }

    // 14. collection seoDescription
    if (col.seoDescription) {
      const c = findClaim(col.seoDescription);
      if (c) {
        issues.push({
          code: 'collection.seoDescription.therapeutic-claim',
          severity: 'high',
          surface: 'collection.seoDescription',
          entityId: col.id,
          entityTitle: col.title,
          excerpt: col.seoDescription.slice(0, 120),
          term: c,
          remediation: 'Editar seo.description da coleção via collectionUpdate.',
        });
      }
    }
  }

  // ---- Artigos de blog ----
  for (const art of articles) {
    // 15. article tags
    if (art.tags) {
      for (const tag of art.tags) {
        const c = findClaim(tag);
        if (c) {
          issues.push({
            code: 'article.tag.therapeutic-claim',
            severity: 'high',
            surface: 'article.tags',
            entityId: art.id,
            entityTitle: art.title,
            excerpt: tag,
            term: c,
            remediation: `Remover tag "${tag}" via articleUpdate GraphQL mutation.`,
          });
          break;
        }
      }
    }

    // 16. article body — links para handles terapêuticos
    if (art.bodyHtml && art.deprecatedHandles && art.deprecatedHandles.length > 0) {
      const body = art.bodyHtml.toLowerCase();
      for (const dh of art.deprecatedHandles) {
        if (body.includes(dh.toLowerCase())) {
          issues.push({
            code: 'article.body.deprecated-handle',
            severity: 'high',
            surface: 'article.bodyHtml',
            entityId: art.id,
            entityTitle: art.title,
            excerpt: `href contém "${dh}"`,
            term: dh,
            remediation: `Substituir href "${dh}" pela URL atualizada via articleUpdate. O href aparece no HTML indexado.`,
          });
          break;
        }
      }
    }
  }

  // ===== Montar relatório =====

  const bySeverity: Record<IssueSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const i of issues) bySeverity[i.severity]++;

  const blockerCount = bySeverity.critical + bySeverity.high;
  const warningCount = bySeverity.medium + bySeverity.low;
  const verdict: 'GO' | 'NO-GO' = blockerCount === 0 ? 'GO' : 'NO-GO';

  // Checklist de todas as superfícies cobertas
  const allSurfaces = [
    'product.title',
    'product.seoTitle',
    'product.seoDescription',
    'product.descriptionHtml',
    'product.productType',
    'product.tags',
    'product.handle',
    'product.media[].alt',
    'product.custom.detalhes_do_produto',
    'product.variants[].price',
    'product.variants[].options',
    'collection.handle',
    'collection.descriptionHtml',
    'collection.seoTitle',
    'collection.seoDescription',
    'article.tags',
    'article.bodyHtml',
  ];

  const issuesBySurface = new Map<string, number>();
  for (const i of issues) {
    issuesBySurface.set(i.surface, (issuesBySurface.get(i.surface) ?? 0) + 1);
  }

  const surfaceChecklist: SurfaceStatus[] = allSurfaces.map((surface) => {
    const count = issuesBySurface.get(surface) ?? 0;
    const hasData =
      (surface.startsWith('product') && products.length > 0) ||
      (surface.startsWith('collection') && collections.length > 0) ||
      (surface.startsWith('article') && articles.length > 0);
    return {
      surface,
      status: !hasData ? 'unchecked' : count > 0 ? 'issues' : 'clean',
      issueCount: count,
    };
  });

  return {
    verdict,
    blockerCount,
    warningCount,
    totalIssues: issues.length,
    issues,
    surfaceChecklist,
    bySeverity,
    stats: {
      productsScanned: products.length,
      collectionsScanned: collections.length,
      articlesScanned: articles.length,
    },
  };
}

/**
 * Renderiza o PreReviewReport em Markdown legível para humanos.
 * Inclui veredicto, checklist por superfície e lista de issues.
 */
export function renderPreReviewReport(report: PreReviewReport, generatedAt?: string): string {
  const ts = generatedAt ?? new Date().toISOString();
  const lines: string[] = [];

  lines.push('# Pre-Review GMC — Relatório Go/No-Go');
  lines.push('');
  lines.push(`**Gerado em:** ${ts}`);
  lines.push(
    `**Escopo:** ${report.stats.productsScanned} produtos · ` +
    `${report.stats.collectionsScanned} coleções · ` +
    `${report.stats.articlesScanned} artigos`,
  );
  lines.push('');

  // Veredicto
  const verdictEmoji = report.verdict === 'GO' ? '🟢' : '🔴';
  lines.push(`## ${verdictEmoji} Veredicto: ${report.verdict}`);
  lines.push('');
  lines.push(`| Severidade | Count |`);
  lines.push(`|---|---|`);
  lines.push(`| Critical | ${report.bySeverity.critical} |`);
  lines.push(`| High | ${report.bySeverity.high} |`);
  lines.push(`| Medium | ${report.bySeverity.medium} |`);
  lines.push(`| Low | ${report.bySeverity.low} |`);
  lines.push(`| **Blockers (critical+high)** | **${report.blockerCount}** |`);
  lines.push('');

  // Checklist de superfícies
  lines.push('## Checklist de Superfícies');
  lines.push('');
  lines.push('| Superfície | Status | Issues |');
  lines.push('|---|---|---|');
  for (const s of report.surfaceChecklist) {
    const emoji = s.status === 'clean' ? '✅' : s.status === 'issues' ? '🔴' : '⬜';
    lines.push(`| ${s.surface} | ${emoji} ${s.status} | ${s.issueCount > 0 ? s.issueCount : '—'} |`);
  }
  lines.push('');

  // Lista de issues
  if (report.issues.length > 0) {
    lines.push('## Issues Encontrados');
    lines.push('');

    const bySeverityOrder: IssueSeverity[] = ['critical', 'high', 'medium', 'low'];
    for (const sev of bySeverityOrder) {
      const sevIssues = report.issues.filter((i) => i.severity === sev);
      if (sevIssues.length === 0) continue;
      const sevEmoji = sev === 'critical' ? '🔴' : sev === 'high' ? '🟠' : sev === 'medium' ? '🟡' : '🔵';
      lines.push(`### ${sevEmoji} ${sev.toUpperCase()} (${sevIssues.length})`);
      lines.push('');
      for (const i of sevIssues) {
        lines.push(`**[${i.code}]** ${i.entityTitle} (\`${i.entityId}\`)`);
        lines.push(`- Surface: \`${i.surface}\``);
        if (i.term) lines.push(`- Termo: "${i.term}"`);
        lines.push(`- Trecho: _"${i.excerpt}"_`);
        lines.push(`- Fix: ${i.remediation}`);
        lines.push('');
      }
    }
  } else {
    lines.push('## ✅ Nenhum issue encontrado');
    lines.push('');
    lines.push('Todas as superfícies auditadas estão limpas. Pode prosseguir com o Request Review.');
    lines.push('');
  }

  lines.push('---');
  lines.push('_Gerado por `pre-review-validator` (N20.3). Não substitui revisão jurídica._');
  return lines.join('\n');
}
