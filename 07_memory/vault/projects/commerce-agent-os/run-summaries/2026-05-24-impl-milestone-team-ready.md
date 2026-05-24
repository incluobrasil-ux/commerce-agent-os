---
created_at: 2026-05-24T00:30:00.000Z
updated_at: 2026-05-24T00:30:00.000Z
tags: [impl-milestone, team-ready, doctor, onboarding]
source: human:incluobrasil
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 10_ops/scripts/doctor.ts
  - 10_ops/scripts/SETUP_LOCAL.md
  - 10_ops/scripts/COMMANDS.md
  - README.md
  - .env.example
---

# Repo fechado para uso da equipe — `pnpm doctor` valida tudo

## Contexto

Marco de fechamento operacional. Tudo o que foi construído até aqui (núcleo `@cao/*`, 6 agentes reais, pipeline Merchant, cérebro multi-operador, brain-bridge) agora tem **1 comando único de verificação** e DX consistente em 4 documentos. Qualquer pessoa pode clonar em outro PC e validar em < 1 min.

## O que aconteceu

**1. `pnpm doctor` (novo, `10_ops/scripts/doctor.ts`):**
- Verificação cross-platform sem dependências externas além de Node + pnpm.
- Checa 10 itens em ordem: node ≥ 20, pnpm ≥ 9, git, node_modules, typecheck, lint, test:smoke, .env.local, gitleaks, cérebro.
- Exit 0 se sem fails (warnings ok); exit 1 se algum check fail.
- Mensagens com hint de ação ("→ rodar pnpm install", "→ winget install gitleaks", etc.).
- Pula checks pesados se `node_modules` ausente (não trava o diagnóstico).
- Validado real: 10/10 🟢 local com gitleaks no PATH.

**2. Docs harmonizados (4 arquivos):**
- `README.md`: "Como rodar localmente" reduzido a `pnpm install && pnpm doctor`. Sem ruído.
- `10_ops/scripts/SETUP_LOCAL.md`: TL;DR no topo + 2 modos (mínimo vs completo) + tabela do que `doctor` checa.
- `10_ops/scripts/COMMANDS.md`: nova seção "Verificação" no topo; tabela rápida com `pnpm doctor` como primeira ação.
- `.env.example`: já estava bom — mantido.

**3. Consistência cross-doc:**
- Comando `pnpm doctor` aparece em README + SETUP_LOCAL + COMMANDS, sempre como **primeira ação**.
- 8 comandos `pnpm` listados consistentemente nos 3 docs (audit:repo, llm:smoke, synthesize:audit, curate:memory, context:brief, shopify:list-products, feed:dry-run, ops:capture) + doctor.
- Variáveis de ambiente listadas em .env.example com mesma estrutura citada em SETUP_LOCAL.

## Achados / decisões

- **Doctor escrito em TypeScript (não bash)** para ser cross-platform de verdade. Bash funciona em Mac/Linux/Git-Bash mas tem edge cases (ex.: gitleaks no PATH WinGet do Windows). TS via tsx funciona igual em qualquer plataforma onde pnpm já está.
- **Doctor não auto-instala nada.** Cada check com fail tem um `hint` que diz exatamente o comando para resolver. Operador escolhe quando rodar `pnpm install`, `winget install gitleaks`, etc. Evita comportamento mágico não-solicitado.
- **`.env.local` e `gitleaks` como warning, não fail.** Baseline (typecheck + lint + test:smoke + audit:repo) não exige nenhum dos dois. Eles são pré-requisitos para LLM/Shopify/Merchant ou para pre-commit completo, mas não para "validar o clone funciona".
- **Output de `pnpm doctor` aparece silencioso quando rodado via `pnpm` em alguns shells** (PowerShell + spawnSync). Workaround: rodar direto via `npx tsx` se precisar de output garantido em scripts. Não afeta uso interativo normal.

## Impacto

- **DoR de team-ready atingido.** Outra pessoa pode: clonar → install → doctor → ler `current-state.md` → ler `next-actions.md` → começar a trabalhar. Sem precisar perguntar nada para o operador anterior.
- Pre-commit hooks já vinham ativos; doctor + secret-scan + lint + smoke garantem que código quebrado não entra em main.
- **Próximo dev** (ou Claude em outro PC) clona, roda 2 comandos, e sabe imediatamente se o ambiente é seguro de mexer.
- Cérebro continua sendo o entry point para "o que fazer a seguir" — doctor aponta para ele explicitamente no fim do output.

## Ações geradas

- [ ] Quando algum operador clonar em outro PC, validar fluxo end-to-end e capturar quaisquer fricções (rodar `pnpm doctor` lá; se algo der 🔴 ou 🟡 não previsto, abrir issue).
- [ ] Considerar adicionar `pnpm doctor` ao CI (job pré-suite que falha rápido se setup quebrar).
- [ ] Quando tiver gitleaks instalável via npm wrapper, mudar `secret-scan` para usá-lo — elimina o passo manual de OS install.

## Referências

- script: [`10_ops/scripts/doctor.ts`](../../../../../10_ops/scripts/doctor.ts)
- comando: `pnpm doctor`
- docs harmonizados: [`README.md`](../../../../../README.md), [`10_ops/scripts/SETUP_LOCAL.md`](../../../../../10_ops/scripts/SETUP_LOCAL.md), [`10_ops/scripts/COMMANDS.md`](../../../../../10_ops/scripts/COMMANDS.md)
