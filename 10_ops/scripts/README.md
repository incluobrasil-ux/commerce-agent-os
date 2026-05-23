# 10_ops/scripts

Scripts operacionais. Cada um documenta seu propósito no header.

## Convenções

- Default: **dry-run**. Mudanças destrutivas exigem `--apply` explícito.
- Shell scripts em bash/sh (Windows: rodar via WSL, Git Bash ou PowerShell quando portável).
- Scripts Node em `.mjs` ou `.ts` (via `tsx` quando disponível).
- Saída legível para humano + códigos de saída UNIX (0 = ok, 1 = erro).

## Scripts atuais

| Script | Função | Status |
|---|---|---|
| `check-env.sh` | Confirma que ferramentas essenciais (node, pnpm, git) estão instaladas | placeholder |
| `validate-structure.sh` | Valida que a árvore do monorepo bate com a esperada | placeholder |
| `bootstrap.sh` | Roda check-env → pnpm install → typecheck → smoke (a popular na Fase 5) | placeholder |

## Não fazer aqui

- Scripts que tocam **dados de produção** sem confirmação explícita.
- Scripts que dependem de segredos sem ler de env (`.env` ou secret manager).
- Lógica de domínio — apps em `04_apps/` cobrem isso.
