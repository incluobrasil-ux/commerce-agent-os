---
created_at: 2026-05-27T20:00:00Z
updated_at: 2026-05-27T20:00:00Z
tags: [merchant, audit, gmc, incluo, misrepresentation, manual-action, blocker, t0]
source: agent:orchestrator-master+chat-session
kind: audit
result: red
confidence: 0.95
related:
  - 07_memory/vault/projects/commerce-agent-os/run-summaries/2026-05-26-audit-gmc-multi-agent-rerun-incluo.md
  - 07_memory/vault/projects/commerce-agent-os/next-actions.md
  - 07_memory/vault/projects/commerce-agent-os/operations/chefe-da-operacao.md
---

# Auditoria GMC — Bloqueio por Deturpação (Misrepresentation) descoberto em Incluo

## Contexto

Sessão de chat operacional do Chefe sobre a operação Incluo. Operador (Samuel) abriu Shopify Admin + Google Ads + Google Merchant Center no navegador para análise. Compartilhou três artefatos no chat:

1. **Print GMC → Diagnostics**: alerta vermelho "Deturpação — Impede que todos os produtos apareçam em Brasil". Última revisão solicitada em 19-mai-2026 foi **negada**. Marcador: "O Google encontrou esse problema usando uma verificação manual".
2. **Prints config Simprosys/GMC shipping**: frete grátis, 3 dias separação + 1-4 trânsito (4-7 dias úteis), BRL, Brasil — OK.
3. **Export do feed Simprosys** (`produtos_2026-05-27_17-38-43.txt`, ~150 produtos com 35+ colunas) — primeira vez que se tem o feed REAL que vai ao GMC (até hoje vault só tinha snapshot Shopify cru via MCP).

Integração com Shopify confirmada via MCP (`get-shop-info` → Incluo, BRL, BR, contato@incluobrasil.com).

## O que aconteceu

### Descoberta crítica que muda toda a priorização

**Misrepresentation manual action está ativa.** Isso é um nível acima de todos os achados anteriores do scorer (`pnpm merchant:audit`): mesmo com score 93.2/100 e zero crítico no audit determinístico, **nenhum produto da Incluo aparece em Brasil** porque um revisor humano do Google classificou a loja como "enganosa".

Esse achado **invalida temporariamente** a estratégia anterior (N20.2 + N26 + handles + SKU normalization) como path de desbloqueio. Aqueles fixes continuam corretos como T1, mas não levantam a manual action sozinhos.

### Cruzamento feed real × política de Deturpação

Olhei o feed Simprosys completo e cruzei com a [policy de Misrepresentation do Google](https://support.google.com/merchants/answer/6150127). Três sinais convergentes para manual review:

**1. Claims terapêuticos massivos em titles e descriptions (sinal #1, mais grave)**

Texto recorrente no feed em dezenas de SKUs:
- *"ferramenta de autorregulação"* (50+ ocorrências)
- *"alívio do estresse"*, *"alívio de ansiedade"*
- *"para pessoas com TDAH, TEA ou ansiedade"* (em fidget sliders, bolas giroscópio, rabanete squishy, colete sensorial)
- *"trata"*, *"autismo"*, *"depressão"*, *"anti-ansiedade"*, *"anti-depressão"*
- *"gerenciamento de sobrecarga sensorial"*

Loja **sem registro ANVISA** vendendo brinquedo com essa linguagem = dispositivo médico não autorizado pela ótica regulatória brasileira (RDC 204/2017, Lei 12.764/2012 — Berenice Piana) E misrepresentation pela ótica Google.

Confirma achado do compliance LLM HIGH do PDP `contas-madeira` (run 2026-05-26 17:47) — só que agora se vê que **não é só naquele produto**, é catálogo inteiro.

**2. Padrão SKU AliExpress não disfarçado (sinal #2)**

Apesar do N26.b ter normalizado 39 produtos / 119 variantes em 2026-05-26, o feed atual ainda mostra SKUs no padrão `14:XXX#YYY` em dezenas de itens:
- `14:200006152#VT03-GREEN-GREEN`
- `14:29#6pcs set chew ring`
- `14:173#1PC 5MIN`
- `14:200006153#20 CM`
- `14:496#Dinosaur Park`

Confirma o que o `next-iter-SKU` em next-actions já apontava: pgs 2/3 do catálogo (~50 produtos) ficaram fora do bulk. Esses SKUs vão para o GMC e revisor humano lê como dropship sem disclosure.

**3. Identidade de negócio insuficiente (sinal #3)**

A própria página do GMC do print explicita: *"Seja transparente com a identidade, o modelo de negócios"* + *"confirme se os dados do produto no Merchant Center correspondem aos da loja on-line"*. Vault tem políticas (privacy/refund/TOS/contact) em `incluobrasil.com/policies/*` retornando 200 OK (confirmado 26-mai), MAS:
- Não há página "Quem somos / Sobre" robusta com modelo de negócio explicado
- Simprosys faz remap de title (ele pode estar mandando ao GMC titles diferentes dos da loja — mismatch que reviewer detecta)

## Achados / decisões

### Achados que invalidam priorização anterior

- **Score 93.2 do scorer determinístico é enganoso** sem leitura do GMC Diagnostics. Operação ALL GREEN no audit interno mas BLOQUEADA pelo Google na prática. **Próximas auditorias precisam puxar status do GMC** (não só Shopify) para reflectir realidade.
- **`pnpm merchant:audit` não detecta misrepresentation** porque mede conformidade técnica de catálogo, não política de plataforma. Gap arquitetural — proposta de evolução em "Ações geradas" abaixo.

### Achados novos não pegos por audits anteriores

- **N20.2 keywords PT-BR estavam corretas mas mal-priorizadas como `low/medium`** — Google as trata como severity crítica quando concentradas em catálogo inteiro. Reescalada para `high/critical` em escopo.
- **Simprosys como canal**: confirmado que feed não é o do channel nativo Google & YouTube da Shopify. Configurações de remap precisam ser auditadas separadamente (próxima sessão).
- **N26.b ficou incompleto**: ~50 produtos das pgs 2/3 ainda têm SKU `14:XXX#YYY` no catálogo (esperado, já estava em next-actions como `next-iter-SKU`), mas agora é bloqueador real para destravar GMC, não otimização.

### Decisão estratégica do Chefe nesta sessão

Reordenar a fila operacional. T0 absoluto agora é levantar a manual action. Tudo o resto — N27 (writeback real), N28 (exit code 3), N29 (legal-profile), N26.c/d — fica em espera até GMC liberar Brasil.

## Impacto

- **Operação Incluo está com receita Google Shopping = R$ 0** desde antes de 19-mai (data da review negada). Toda a otimização técnica feita no vault tem valor zero comercial enquanto isso não resolver.
- **Cooldown estimado**: 7-14 dias entre fix completo e re-review aprovada (estimativa baseada em [GMC policy timing](https://support.google.com/merchants/answer/2948694)). Se a re-review for negada de novo, próximo ciclo é mais longo (Google penaliza tentativas mal-preparadas).
- **Janela crítica**: a fila tem que estar 100% limpa antes do re-request. Pedido prematuro = perdemos 14+ dias.
- **Aprendizado para o sistema**: o playbook merchant-audit precisa incluir um STEP 0 obrigatório de "verificar GMC Diagnostics no navegador" antes de rodar scorer. Score determinístico sozinho engana.

## Ações geradas

### T0 — Levantar misrepresentation (bloqueia tudo)

- [ ] **T0.1 (operacional, alto volume)** — Reescrita de PDPs: remover de titles e descriptions os termos `TDAH`, `TEA`, `autismo`, `ansiedade`, `depressão`, `anti-estresse`, `anti-ansiedade`, `trata`, `alívio`, `autorregulação`, `ADHD`, `OCD`. Substituir por linguagem funcional neutra (foco, concentração, conforto tátil, brinquedo manipulativo, estímulo sensorial). **Guia operacional pronto:** [`12_reports/misrepresentation-remediation/incluo/rewrite-guide-pdp-20260527.md`](../../../../../12_reports/misrepresentation-remediation/incluo/rewrite-guide-pdp-20260527.md) com tabelas find→replace + 10 exemplos antes/depois.
- [ ] **T0.2 (operacional, ~5 min)** — Disclaimer médico padronizado no rodapé de TODA PDP: "Não é dispositivo médico nem substitui acompanhamento profissional. Brinquedo recreativo." Algumas PDPs já têm, padronizar via Shopify theme footer ou metafield.
- [ ] **T0.3 (operacional, ~30 min)** — Reforçar página "Quem somos / Sobre" com: razão social, CNPJ, modelo de negócio explícito ("loja de brinquedos sensoriais — curadoria de produtos importados"), nome/foto dos sócios se possível, sem claims clínicos.
- [ ] **T0.4 (operacional, bulk)** — Completar N26.b nas pgs 2/3 do catálogo: trocar SKUs `\d+:\d+#` restantes por `INC-<slug>-<variante>`. Já estava em backlog como next-iter, agora promovido a bloqueador.
- [ ] **T0.5 (operacional)** — GMC → Diagnostics → "Solicitar nova análise" com nota explicando as quatro mudanças acima. **Não executar antes de T0.1–T0.4 completos.** **Template da nota pronto:** [`12_reports/misrepresentation-remediation/incluo/re-review-note-gmc-20260527.md`](../../../../../12_reports/misrepresentation-remediation/incluo/re-review-note-gmc-20260527.md).

### T1 — Pós-liberação (só depois que GMC aprovar)

- N26.c (mapping productType → GMC taxonomy)
- N26.d (brand prefix nos títulos)
- N27 (primeiro writeback real `--apply`)
- Auditar mapeamento Simprosys para garantir paridade title/description entre feed e PDP

### T2 — Evolução arquitetural derivada

- **N30 (proposta nova)**: Adicionar ao playbook `merchant-audit` step de captura GMC Diagnostics (manual via prompt ao operador OU automatizado via Google Content API se houver token). Sem isso, scorer determinístico continua dando falso verde.
- **N31 (proposta nova)**: Estender `HIGH_RISK_KEYWORDS` para reclassificar termos PT-BR clínicos como severity `critical` (não `low`) quando concentrados em >20% do catálogo. Hoje a soma desses lows não dispara crítico, mas operacionalmente eles ARE crítico.

## Referências

- print Diagnostics GMC: anexado no chat 2026-05-27
- feed Simprosys: `produtos_2026-05-27_17-38-43.txt` (efêmero do chat)
- baseline scorer pré-descoberta: [`2026-05-26-audit-gmc-multi-agent-rerun-incluo.md`](2026-05-26-audit-gmc-multi-agent-rerun-incluo.md)
- compliance LLM HIGH PDP contas-madeira (já mapeava parte dos claims): `07_memory/vault/tenants/incluo-tenant/stores/incluo/compliance/contas-madeira-pdp-review-20260526-174712.md`
- política Google: https://support.google.com/merchants/answer/6150127
- regulação BR: ANVISA RDC 204/2017, Lei 12.764/2012 (Berenice Piana), CDC art. 37
