// Pipeline pura — sem CLI, sem rede. Recebe produtos + opções,
// aplica transformer + validator + (opcional) SEO, e retorna dados pra escrita.

import {
  type FeedRow,
  type ShopifyProductInput,
  type TransformOptions,
  type ValidationResult,
  productToFeedRow,
  validateFeedRow,
} from '@cao/integration-google-merchant';
import type { CompleteFn } from '@cao/llm';
import type { Memory } from '@cao/memory';
import type { ObservabilityProvider } from '@cao/observability';
import { productFeedSEOAgent } from '@cao/product-feed-seo';
import { runAgent } from '@cao/runtime';

export interface PipelineOptions {
  tenantId: string;
  transform: TransformOptions;
  /** Se fornecido, roda product-feed-seo para cada produto antes de transformar. */
  seo?: {
    complete: CompleteFn;
    memory: Memory;
    observability: ObservabilityProvider;
  };
}

export interface PipelineRowResult {
  source: ShopifyProductInput;
  seoApplied: boolean;
  seoRationale: string | null;
  row: FeedRow;
  validation: ValidationResult;
  warnings: string[];
}

export interface PipelineResult {
  rows: PipelineRowResult[];
  totalSeoCostUsd: number;
}

export async function runFeedPipeline(
  products: ShopifyProductInput[],
  opts: PipelineOptions,
): Promise<PipelineResult> {
  const results: PipelineRowResult[] = [];
  let totalSeoCostUsd = 0;

  for (const original of products) {
    let product = original;
    let seoApplied = false;
    let seoRationale: string | null = null;

    if (opts.seo) {
      try {
        const out = await runAgent(
          productFeedSEOAgent,
          {
            productHandle: product.handle,
            originalTitle: product.title,
            originalDescription: product.descriptionHtml ?? product.title,
            brand: product.vendor ?? null,
            productType: product.productType ?? null,
            maxTitleChars: 150,
            maxDescriptionChars: 5000,
          },
          { tenantId: opts.tenantId },
          {
            complete: opts.seo.complete,
            memory: opts.seo.memory,
            observability: opts.seo.observability,
          },
        );
        totalSeoCostUsd += out.costUsd;
        seoRationale = out.output.rationale;
        if (out.output.changedTitle || out.output.changedDescription) {
          seoApplied = true;
          const newTitle = out.output.changedTitle ? out.output.suggestedTitle : product.title;
          const newDescription = out.output.changedDescription
            ? `<p>${out.output.suggestedDescription}</p>`
            : product.descriptionHtml;
          product = {
            ...product,
            title: newTitle,
            ...(newDescription !== undefined ? { descriptionHtml: newDescription } : {}),
          };
        }
      } catch (err) {
        // SEO opcional — falha não interrompe pipeline. Registra rationale como erro.
        seoRationale = `SEO step failed: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    const tx = productToFeedRow(product, opts.transform);
    const validation = validateFeedRow(tx.row);

    results.push({
      source: original,
      seoApplied,
      seoRationale,
      row: tx.row,
      validation,
      warnings: tx.warnings,
    });
  }

  return { rows: results, totalSeoCostUsd };
}
