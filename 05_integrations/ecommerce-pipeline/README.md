# @cao/ecommerce-pipeline

Wrapper TS leve para o `ecommerce-pipeline` (Python sidecar **externo** ao monorepo).

## O que é

O `ecommerce-pipeline` é um pipeline Python autônomo que faz:

1. **Mineração** — busca produtos no AliExpress por palavras-chave
2. **Curadoria** — filtra por avaliação/pedidos/preço
3. **Geração de imagens** — gera assets profissionais via Higgsfield AI (`nano_banana`)

Repo: https://github.com/incluobrasil-ux/ecommerce-pipeline
Localização default: `~/ecommerce-pipeline/` (configurável via `ECOMMERCE_PIPELINE_ROOT`)

## Por que externo

Decidimos manter o pipeline **fora do monorepo** porque:

- Já tem ciclo próprio de `git pull` e projetos em `projects/<loja>/`
- É Python (CLAUDE.md permite "Python só em sidecar isolado") — manter externo respeita o limite
- Imagens geradas vão para `Área de Trabalho/<loja>/imagens de produto/` (fora de qualquer repo)
- Zero acoplamento: se o pipeline evoluir, basta `git pull` lá — este wrapper continua valendo enquanto o schema do `project.json` não mudar

## Uso

```ts
import { runStep, resolvePipeline } from '@cao/ecommerce-pipeline';

// Resolve sem rodar (validação)
const resolved = resolvePipeline();
console.log(resolved.pipelineRoot);

// Roda mineração
const result = await runStep(
  { projectName: 'mireloo', step: 'mine' },
  { logger: (ch, line) => console.log(`[${ch}] ${line}`) },
);
console.log(result.exitCode, result.durationMs);
```

## Configuração

| Variável | Default | Descrição |
|---|---|---|
| `ECOMMERCE_PIPELINE_ROOT` | `~/ecommerce-pipeline` | Caminho absoluto do repo Python |
| `AE_APP_KEY`, `AE_APP_SECRET`, etc. | — | Vivem no `.env` do repo Python, **não** no `.env.local` do monorepo |

## Onde se encaixa no Chefe (@cao/orchestration)

Registrado como agente `product-mining` (Tier 5, `kind: deterministic`, `sideEffects: writes-external`).

Playbook: `product-discovery-pipeline` (mine → curate → images com aprovação manual a cada produto).
