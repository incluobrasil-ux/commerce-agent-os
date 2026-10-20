# Plano de Remediação de Densidade — Blocos Boilerplate

**Loja:** incluobrasil.com (Shopify)
**Data:** 2026-06-03
**Modo:** SOMENTE LEITURA — nada foi aplicado. Nenhuma mutation executada.
**Universo:** 143 produtos paginados na íntegra (50 + 50 + 43), campo `descriptionHtml`.

## Objetivo
Detectar blocos de texto que se repetem (quase) literalmente em vários produtos e reescrevê-los para **reduzir a densidade de termos genéricos** (sensorial, tátil, estímulo, cognitivo, desenvolvimento), **sem purgar a palavra-categoria**. A reescrita descreve o que a **criança faz** (toca, empilha, aperta, observa, encaixa) em vez do que o produto "causa/estimula/desenvolve".

**Termos genéricos contados:** raízes `sensoria`, `tatil/tátil`, `estimul/estímul`, `cognitiv`, `desenvolv`.

**Teste de 3 perguntas (aplicado a cada NOVO texto):**
1. Descreve brincadeira/uso concreto? 2. Um leigo lê como brinquedo comum? 3. Livre de raiz da blocklist clínica (terapia, proprioceptivo, calmante, regulação, foco-como-tratamento)?

---

## Resumo dos blocos recorrentes detectados

| # | Bloco | Produtos | Densidade média (genéricos/frase) antes | Ação |
|---|---|---|---|---|
| 1 | "Garantia de Qualidade Incluo" (rodapé + fórmula de benefícios no slot) | **52** | ~1,4 (slot) | Reescrever slot |
| 2 | "Estímulo sensorial tátil: … proporciona estímulo tátil …" | **5** (template; 3 verbatim puros) | **5,0** | Reescrever (pior caso) |
| 3 | "Suporte à conforto sensorial: redução de estímulos auditivos favorece a organização sensorial…" | **6** | **3,0** | Reescrever |
| 4 | "Desenvolvimento motor: Estimula a coordenação motora fina…" | **7** | **2,0** | Reescrever |
| 5 | "Apoio ao foco: estímulo tátil … apoia o bem-estar e a atenção" | **3** | **2,0** | Reescrever |
| 6 | Header "Ambientes de apoio ao foco e conforto sensorial" | **11** | 1,0 | Reescrever header |
| 7 | "⚠ Aviso: Este produto é um brinquedo recreativo…" (disclaimer legal) | **41** | 0 | **NÃO mexer** (texto de compliance, 0 genéricos) |

> Nota: a contagem "genéricos/frase" do bloco 1 refere-se ao *slot variável* de benefícios; o restante da frase boilerplate é fixo e tem 0 genéricos.

---

## BLOCO 1 — "Garantia de Qualidade Incluo" (52 produtos)

Rodapé padrão presente em 52 das 143 descrições. A estrutura é fixa; o que varia é o **slot de benefícios** após "para …, com foco em…". É nesse slot que se empilham os termos genéricos.

**VERBATIM (forma mais comum — molde fixo):**
> "Garantia de Qualidade Incluo: Produto selecionado e curado pela Incluo para **\<SLOT DE BENEFÍCIOS\>**, com foco em segurança de materiais e qualidade [infantil]."

**Variações de slot observadas (densidade entre colchetes):**
- `redução de ruído, conforto sensorial auditivo e apoio ao foco` (6x) [1 gen]
- `desenvolvimento motor grosso, equilíbrio e apoio ao foco` (3x) [1 gen]
- `estímulo tátil, apoio ao foco e auxílio ao foco` (2x) [2 gen]
- `desenvolvimento cognitivo, motor e sensorial` (2x) [**3 gen**]
- `estímulo sensorial oral, apoio ao foco e conforto sensorial` (1x) [**3 gen**]
- `estimulação sensorial e desenvolvimento cognitivo infantil com base no método Montessori` (1x) [**4 gen**]
- `estímulo sensorial, conforto tátil e desenvolvimento motor` (1x) [**4 gen**]
- `estímulo sensorial auditivo e visual, desenvolvimento cognitivo e aprendizado bilíngue` (1x) [**4 gen**]
- (…vários slots de 0–2 genéricos, ex.: `suporte ao foco, gestão do tempo e organização pessoal` [0 gen])

**Problema:** o molde permite até 3–4 genéricos empilhados numa frase só. Densidade do slot pior caso = 4 genéricos/frase.

**NOVA versão proposta (molde reescrito — preserva tom de venda e a palavra-categoria 1x):**
> "Garantia de Qualidade Incluo: produto selecionado e curado pela nossa equipe, com foco em segurança dos materiais, acabamento e durabilidade para o uso infantil. Ideal para a criança **\<O QUE A CRIANÇA FAZ\>**."

Onde `\<O QUE A CRIANÇA FAZ\>` é um verbo de brincadeira por produto, no máximo **1 termo genérico na frase inteira**. Exemplos de preenchimento do slot:
- protetor/abafador → "…usar em ambientes barulhentos e descansar com mais tranquilidade."
- pulseira/pop-it/fidget → "…apertar, esticar e manter as mãos ocupadas durante a aula ou o trabalho."
- prancha/disco de equilíbrio → "…subir, equilibrar-se e se movimentar brincando."
- mordedor → "…morder e levar à boca com segurança na fase da dentição."
- cartões/Montessori → "…separar, encaixar e nomear figuras enquanto brinca."

**Densidade antes → depois:** slot de até **3–4 genéricos/frase** → **0–1 genérico/frase** (a palavra-categoria sobrevive em "uso infantil" / no nome do produto).

---

## BLOCO 2 — "Estímulo sensorial tátil: … proporciona estímulo tátil …" (5 produtos)

O pior caso de densidade da loja: **5 genéricos numa única frase** (duplica "sensorial"/"tátil"/"estímulo").

**VERBATIM (3 ocorrências quase idênticas):**
> "Estímulo sensorial tátil: pressionar as bolhas de silicone proporciona estímulo tátil repetitivo e satisfatório" (pulseiras-pop-it-fidget-silicone-kit-12-unidades)
> "Estímulo sensorial tátil: 6 texturas diferenciadas (relevos, pontos, ondas, padrões de animais) proporcionam estímulo tátil variado e satisfatório" (pulseiras-fidget-sensoriais-texturizadas-silicone-kit-6)
> "Estímulo sensorial tátil: textura macia e elasticidade do TPR proporcionam estímulo tátil satisfatório através de estiramento e manipulação" (pulseiras-elasticas-sensoriais-alpaca-fidget-kit-6-tpr)

(template também em: conjunto-tenda-piscina-bolinhas-tunel-desenvolvimento-motor-3em1, disco-equilibrio-sensorial-inflavel-motor-grosso)

**NOVA versão proposta (descreve a ação da criança; 1 genérico no rótulo, 0 no corpo):**
> "Textura para tocar: a criança pressiona as bolhas e sente os relevos de silicone — uma textura macia e satisfatória ao toque."
> "Texturas variadas: 6 acabamentos diferentes (relevos, pontos, ondas e padrões de animais) para a criança apertar, esticar e explorar com as mãos."
> "Toque macio: a elasticidade do TPR convida a criança a esticar, torcer e apertar quando quer manter as mãos ocupadas."

**Densidade antes → depois:** **5 genéricos/frase → 1 genérico/frase** (mantém "textura/tátil" 1x no rótulo).

---

## BLOCO 3 — "Suporte à conforto sensorial: redução de estímulos auditivos favorece a organização sensorial…" (6 produtos)

**VERBATIM (forma mais comum):**
> "Suporte à conforto sensorial: redução de estímulos auditivos favorece a organização sensorial e emocional"

Variações: "…favorece a organização sensorial e o descanso"; "…ambiente acústico controlado favorece a organização sensorial e emocional".

**Handles:** abafador-ruido-bebe-faixa-conforto-sensorial-23db, abafador-ruido-infantil-unicornio-nrr25db, protetor-auditivo-infantil-reducao-ruido-zohan, protetor-auricular-infantil-orelhas-gato-conforto-acustico, protetor-auricular-infantil-reducao-ruido-25db-bebe, protetor-auricular-silicone-conforto-sensorial-descanso.

**Problema:** 3 genéricos/frase ("sensorial" ×2 + "estímulos") e "organização sensorial e emocional" é clínico-adjacente (regulação). Reescrever descrevendo o que acontece de concreto.

**NOVA versão proposta:**
> "Mais silêncio para a criança: ao abafar o barulho ao redor, ajuda a criança a ficar mais tranquila em ambientes ruidosos, na hora de dormir ou de se concentrar."

**Densidade antes → depois:** **3 genéricos/frase → 0–1 genérico/frase**; remove "organização sensorial/emocional" (clínico-adjacente).

---

## BLOCO 4 — "Desenvolvimento motor: Estimula a coordenação motora fina…" (7 produtos)

**VERBATIM (variações):**
> "Desenvolvimento motor: Estimula a coordenação motora fina e a destreza das mãos"
> "Desenvolvimento Motor Fino: Estimula destreza manual e coordenação motora fina por meio da manipulação das articulações"
> "Desenvolvimento Motor: Estimula a coordenação motora fina por meio do uso regular"

**Handles:** brinquedo-educativo-matematica-contagem-numeros-feltro, cobra-articulada-sensorial-fidget-zootopia-2, livro-fracoes-magnetico-montessori-matematica-madeira, mordedor-sensorial-formato-t-silicone-infantil, orbita-cubo-sensorial-infinito-conforto-tatil-foco, pelucia-alfabeto-ingles-educativo-26-letras, quadro-rotina-visual-bilingue-organizacao-infantil.

**Problema:** abre com "Desenvolvimento … Estimula" (2 genéricos) e fraseia o produto como agente ("estimula"). Trocar por descrição do gesto.

**NOVA versão proposta:**
> "Mãos em movimento: girar, encaixar e manipular as peças com os dedos faz a criança treinar a coordenação das mãos enquanto brinca."

(adaptar o verbo ao produto: "dobrar a cobra articulada", "encaixar as frações", "passar as contas")

**Densidade antes → depois:** **2 genéricos/frase → 1 genérico/frase** (mantém "coordenação" como categoria; remove "desenvolvimento" e troca "estimula" por ação da criança).

---

## BLOCO 5 — "Apoio ao foco: estímulo tátil … apoia o bem-estar e a atenção" (3 produtos)

**VERBATIM:**
> "Apoio ao foco: estímulo tátil estruturado apoia o bem-estar e a atenção" (slime-sensorial-reutilizavel-massa-cristal-foco)
> "Apoio ao foco: estímulo tátil discreto apoia o bem-estar e a atenção durante tarefas" (bola-sensorial-montessori-estimulo-motor)
> "Apoio ao foco: estímulo tátil discreto apoia o bem-estar e a atenção" (painel-sensorial-silicone-foco)

**Problema:** "apoia o bem-estar e a atenção" é foco-como-tratamento (clínico-adjacente). 2 genéricos/frase.

**NOVA versão proposta:**
> "Mãos ocupadas: ter algo macio para apertar e mexer ajuda quem gosta de manter as mãos em movimento durante a aula, a leitura ou o trabalho."

**Densidade antes → depois:** **2 genéricos/frase → 0–1 genérico/frase**; remove "apoia o bem-estar e a atenção".

---

## BLOCO 6 — Header "Ambientes de apoio ao foco e conforto sensorial" (11 produtos)

**VERBATIM (header de seção, idêntico):**
> "Ambientes de apoio ao foco e conforto sensorial"

**Handles:** cartoes-montessori-cognitivos-aprendizado, cubo-emocoes-montessori-jogo-sensorial-expressoes, jogo-classificacao-animais-montessori-sensorial-cores, jogo-expressoes-faciais-montessori-reconhecimento, livro-atividades-procure-pinte-bilingue, poster-abc-interativo-musical-bilingue-aprendizado-infantil, temporizador-arco-iris-silencioso-60min, temporizador-digital-animais-6h, temporizador-silencioso-luz-noturna-60min, temporizador-visual-para-criancas-semaforo-…-temporizador-visual, temporizador-visual-tarefas-quadro-planejamento.

**NOVA versão proposta (header):**
> "Onde usar em casa e na escola"

**Densidade antes → depois:** **1 genérico/frase → 0 genérico/frase** (header puramente descritivo).

---

## BLOCO 7 — "⚠ Aviso: Este produto é um brinquedo recreativo…" (41 produtos) — NÃO ALTERAR

**VERBATIM (forma mais comum):**
> "⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado."

(3 variantes; uma diz "recurso de conforto tátil para uso recreativo")

**Densidade:** 0 genéricos. É **texto de compliance/disclaimer** anti-misrepresentation — recomenda-se **manter** e, idealmente, **padronizar a variante única** em todos os 41 (e estender aos demais produtos que ainda não têm). Não faz parte do escopo "reduzir densidade".

---

## Contagem consolidada de densidade (genéricos por frase)

| Bloco | Antes (pior caso) | Depois | Produtos |
|---|---|---|---|
| 1 — Garantia (slot) | 3–4 | 0–1 | 52 |
| 2 — Estímulo sensorial tátil | 5 | 1 | 5 |
| 3 — Suporte conforto sensorial | 3 | 0–1 | 6 |
| 4 — Desenvolvimento motor | 2 | 1 | 7 |
| 5 — Apoio ao foco | 2 | 0–1 | 3 |
| 6 — Header ambientes | 1 | 0 | 11 |
| 7 — Aviso (disclaimer) | 0 | (manter) | 41 |

**Regra de aceite aplicada a todos os novos textos:** no máximo 1 termo genérico por frase; verbo de ação da criança (toca/aperta/encaixa/observa/equilibra); leigo lê como brinquedo comum; livre de raízes clínicas (terapia, proprioceptivo, calmante, regulação, foco-como-tratamento) — "organização sensorial/emocional", "apoia o bem-estar e a atenção" foram removidos por serem clínico-adjacentes.

**Status:** PLANO somente. Nada aplicado. Próximo passo (fora deste escopo): aplicar via `productUpdate` com revisão humana, produto a produto, preservando o restante da descrição.
