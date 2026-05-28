// Shapes do project.json consumido pelo ecommerce-pipeline (Python sidecar).
// Espelha o schema documentado em CLAUDE.md do repo externo. Mantemos aqui
// em TS apenas para garantir tipagem ao construir/validar configs.

export interface ProjectStore {
  name: string;
  market: readonly string[];
  primary_market: string;
  language: string;
  currency: string;
  niche: string;
}

export interface ProjectBrand {
  style: string;
  tagline: string;
  handle: string;
  palette: Record<string, string>;
  hero_background: string;
  ambient_surface: string;
  ambient_props: string;
  mood: string;
}

export interface ProjectMining {
  platform: 'aliexpress';
  ship_to: string;
  max_price_gbp: number;
  min_orders: number;
  min_rating: number;
  target_products_per_collection: number;
}

export interface ProjectCollection {
  name: string;
  queries: readonly string[];
  pet?: string;
}

export interface ProjectImages {
  /**
   * IMPORTANT: sempre 'nano_banana' (plano Ultra ilimitado).
   * Nunca usar 'nano_banana_2' — consome créditos.
   */
  model: 'nano_banana';
  compare_hero_models: boolean;
  use_flash_draft: boolean;
  types: readonly ('hero' | 'ambient' | 'detail_1' | 'detail_2' | 'social')[];
}

export interface ProjectConfig {
  store: ProjectStore;
  brand: ProjectBrand;
  mining: ProjectMining;
  collections: readonly ProjectCollection[];
  images: ProjectImages;
}

export type PipelineStep = 'mine' | 'curate' | 'images' | 'all';

export interface RunOptions {
  projectName: string;
  step: PipelineStep;
  /** Limit para `--step images` (passa como --limit N ao pipeline). */
  limit?: number;
  /** Timeout em ms. Default: 30min para imagens, 10min para mine/curate. */
  timeoutMs?: number;
}

export interface RunResult {
  step: PipelineStep;
  projectName: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  /** Caminho onde o Python escreveu outputs (cache.json/selected.json/imagens). */
  projectDir: string;
  durationMs: number;
}
