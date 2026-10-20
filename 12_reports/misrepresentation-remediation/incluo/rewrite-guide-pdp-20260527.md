---
created_at: 2026-05-27T20:30:00Z
tags: [misrepresentation, remediation, t0, incluo, pdp-rewrite, shopify-admin]
source: chat-session
kind: operational-guide
related:
  - 07_memory/vault/projects/commerce-agent-os/run-summaries/2026-05-27-audit-gmc-misrepresentation-block-incluo.md
---

# Guia de Reescrita PDP — Levantamento da Misrepresentation Incluo

**Para que serve:** instrução operacional pronta para Samuel aplicar no Shopify Admin via bulk edit / find-and-replace. Cobre as duas frentes que disparam o flag Google: **claims terapêuticos** (em title + description + handle) e **linguagem clínica/diagnóstica**.

**Como usar:**
1. Abra Shopify Admin → Products → All products.
2. Use o atalho `Ctrl+F` no navegador (ou o filtro de busca de produtos) para localizar cada termo da tabela 1.
3. Para cada produto encontrado, abra a PDP e aplique find-replace conforme tabela 2.
4. Para títulos, repita o processo na coluna Title.
5. Não esqueça do campo **Search engine listing → URL handle** (handle precisa estar limpo também — Google lê a URL).

**Estimativa de trabalho:** ~3-4 horas para 150 produtos se feito em batch metódico. Não delegue para freelancer sem revisão — vocabulário regulatório BR é sutil.

---

## Tabela 1 — Termos PROIBIDOS (remover ou substituir em 100% das PDPs)

Esses termos foram detectados no feed Simprosys de 2026-05-27 em titles, descriptions E handles. Cada um isolado já dispara revisor Google para análise manual; concentrados como estão, garantem rejeição.

| Categoria | Termos | Onde aparece | Por que viola |
|---|---|---|---|
| **Diagnóstico clínico** | TDAH, TEA, ADHD, OCD, autismo, asperger, neurodivergente, neurodivergência | title + description | Implica produto para condição médica. ANVISA RDC 204/2017, Google Misrepresentation §"unsupported claims". |
| **Sintoma clínico** | ansiedade, depressão, anti-depressão, estresse crônico, sobrecarga sensorial, hipersensibilidade | description (massivo) | Linguagem médica reservada a profissional. CDC art. 37 (publicidade enganosa). |
| **Verbo terapêutico** | trata, cura, alivia, alívio (de), reduz (sintoma), combate, melhora (condição) | description | Promessa de efeito clínico = dispositivo médico não autorizado. |
| **Conceito clínico-regulado** | autorregulação sensorial, autorregulação, gerenciamento de sobrecarga, integração sensorial, processamento sensorial | description (50+ ocorrências) | Terminologia clínica ANVISA RDC 185/2001. Uso comercial = misrepresentation. |
| **Anti-***  | anti-estresse, anti-ansiedade, antistress | title (vários produtos) | Mesma lógica de "trata X". |
| **Handle/URL** | Qualquer termo acima na URL slug | handle | Google lê URL como conteúdo; igualmente reprovado. |

---

## Tabela 2 — Substituições aprovadas (linguagem funcional neutra)

Estas substituições NÃO disparam misrepresentation porque descrevem **função do objeto**, não **efeito clínico**.

| Original (proibido) | Substituir por | Notas |
|---|---|---|
| "Ferramenta de autorregulação" | "Brinquedo manipulativo" / "Objeto de conforto tátil" | Remove conotação clínica |
| "Alívio do estresse" / "Anti-estresse" | "Para momentos de pausa" / "Conforto durante o dia" | |
| "Para pessoas com TDAH, TEA ou ansiedade" | "Para quem aprecia estímulo tátil" / "Para pausas no trabalho ou estudos" | Mantém público sem rotular |
| "Auxilia na concentração" | "Útil durante atividades de foco" | "Útil" ≠ "auxilia" no léxico Google |
| "Gerenciamento de sobrecarga sensorial" | "Conforto em ambientes movimentados" | |
| "Apoia a autorregulação" | "Apoia momentos de pausa" | |
| "Brinquedo terapêutico" | "Brinquedo sensorial" / "Brinquedo manipulativo" | |
| "Alivia a ansiedade" | (deletar a frase inteira — não substituir) | Sem substituto seguro |
| "Trata o estresse" | (deletar) | Sem substituto seguro |
| "Para autistas / pessoas com autismo" | (deletar a frase inteira) | Sem substituto seguro |
| "Suporte à autorregulação" | "Suporte ao foco" | "Foco" é neutro |
| "Conforto sensorial" | "Conforto tátil" | "Sensorial" sozinho está OK; combinado com "regulação" não |

**Regra de bolso:** se a frase pode ser dita por um terapeuta sobre um paciente, **deletar ou reformular**. Se a frase descreve apenas o objeto físico ("é macio", "gira silenciosamente", "cabe no bolso"), **manter**.

---

## Disclaimer obrigatório (Tabela 3 — adicionar em 100% das PDPs)

Colar no **rodapé final** de toda PDP, dentro do bloco de description. Padrão único:

```
⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico,
não trata, cura ou alivia condições de saúde, e não substitui acompanhamento
profissional. Em caso de necessidade clínica, consulte um profissional de saúde
qualificado.
```

Caminho técnico para evitar fazer 150 vezes manualmente:
- **Opção A (recomendada):** criar metafield global `disclaimer.medical` e renderizar via tema (uma edição no theme.liquid resolve todo o catálogo).
- **Opção B (rápida):** colar no final de cada description via Shopify Admin → Products → Bulk edit → Description (HTML).

---

## Exemplos antes/depois — 10 representativos do catálogo

Tirados do feed Simprosys 2026-05-27. Cobrem as categorias mais frequentes.

### Exemplo 1 — Fidget Slider EDC Metal

**Title atual (proibido):**
`Fidget Slider EDC Metal Magnético - Anti-Estresse Premium para Adultos`

**Title sugerido:**
`Fidget Slider EDC Metal Magnético - Premium para Adultos`

**Description — trecho a remover:**
> "...para adultos com **TDAH, ansiedade ou estresse crônico**, executivos, colecionadores..."

**Substituir por:**
> "...para adultos que valorizam objetos de mesa premium, executivos, colecionadores..."

---

### Exemplo 2 — Bola Giroscópio 3D Universal

**Title atual (proibido):**
`Bola Giroscópio 3D Universal - Anti-Ansiedade com Rotação por Gravidade`

**Title sugerido:**
`Bola Giroscópio 3D Universal - Rotação por Gravidade`

**Description — trecho a remover:**
> "...com **TEA, TDAH ou ansiedade**, fãs de física e mecânica, terapeutas ocupacionais..."

**Substituir por:**
> "...fãs de física e mecânica, profissionais que apreciam objetos cinéticos de mesa..."

---

### Exemplo 3 — Brinquedo Sensorial Rabanete Elástico

**Title atual (proibido):**
`Brinquedo Sensorial Rabanete Elástico Squishy 3D - Anti-Ansiedade Telescópico`

**Title sugerido:**
`Brinquedo Sensorial Rabanete Elástico Squishy 3D - Telescópico`

**Description — frases a deletar inteiras:**
> "Alívio de ansiedade: manipulação repetitiva acalma o sistema nervoso"

**Manter:** "Estímulo tátil profundo: malha elástica oferece textura responsiva"

---

### Exemplo 4 — Colete Sensorial de Compressão

**Title atual:**
`Colete Sensorial de Compressão Infantil - Estímulo Proprioceptivo`

**Title sugerido (manter):** sem alteração — "proprioceptivo" é descritivo do estímulo físico, não claim clínico.

**Description — trecho a reescrever:**
> "...auxiliando no **gerenciamento de sobrecarga sensorial** em momentos de maior agitação"

**Substituir por:**
> "...oferecendo conforto durante atividades que exigem atenção prolongada"

---

### Exemplo 5 — Ampulheta Sensorial Visual

**Title atual:**
`Ampulheta Sensorial Visual 2-3 min - Estímulo Cognitivo e Foco`

**Title sugerido (manter):** OK — sem claim médico.

**Description — trecho a reescrever:**
> "Apoiar o **gerenciamento de sobrecarga sensorial** em ambientes estimulantes"

**Substituir por:**
> "Apoiar momentos de transição entre atividades"

**Frase a deletar:**
> "Ferramenta pedagógica inclusiva" (linguagem pseudo-clínica)

---

### Exemplo 6 — Abafador de Ruído Infantil

**Title atual:**
`Abafador de Ruído Infantil Ajustável - Conforto Sensorial e Auxílio ao Foco`

**Title sugerido:**
`Abafador de Ruído Infantil Ajustável - Conforto Acústico`

**Description — trecho a remover:**
> "Suporte à **autorregulação sensorial auditiva**"
> "**Hipersensibilidade auditiva infantil**"

**Substituir por:**
> "Conforto auditivo em ambientes ruidosos"
> "Para crianças sensíveis a barulho ambiente"

---

### Exemplo 7 — Mordedor Sensorial Tubo

**Title atual:**
`Tubo Sensorial Mastigável Silicone Alimentar BPA Free - 16,5cm Estímulo Oral`

**Title sugerido (manter):** OK.

**Description — trecho a remover:**
> "Suporte à **autorregulação**"
> "Para momentos que requerem **organização emocional**"

**Substituir por:**
> "Para conforto oral durante a fase de dentição"
> (deletar "organização emocional" — sem substituto seguro)

---

### Exemplo 8 — Tapete de Acupressão

**Title atual:**
`Tapete de Acupressão com Travesseiro - Relaxamento Muscular`

**Title sugerido (manter):** OK — "relaxamento muscular" é descritivo físico aceitável.

**Description — manter conforto físico, remover claim circulatório/terapêutico.**

---

### Exemplo 9 — Bola Apertar Expressões Faciais

**Title atual:**
`Bola de Apertar Expressões Faciais | Conforto Sensorial | Incluo`

**Title sugerido (manter):** OK.

**Description — trecho a remover:**
> "Autorregulação emocional"
> "Alívio de tensão"

**Substituir por:**
> "Brinquedo de apertar para uso de mesa"
> (deletar "alívio de tensão")

---

### Exemplo 10 — Cubo Fidget 12 Lados

**Title atual:**
`Cubo Fidget 12 Lados - Foco, Conforto Sensorial e Autorregulação`

**Title sugerido:**
`Cubo Fidget 12 Lados - Foco e Conforto Tátil`

**Description — trecho a reescrever:**
> "Ferramenta de **autorregulação** para momentos de tensão"

**Substituir por:**
> "Objeto manipulativo para pausas durante o dia"

---

## Validação após reescrita

Antes de pedir re-review no GMC, rodar:

```bash
# 1. Re-puxar snapshot fresh do catálogo
pnpm ops:capture --tenant=incluo --store=incluo

# 2. Rodar o scorer com as novas regras N20.2 (já cobrem PT-BR)
pnpm merchant:audit --source=json \
  --file=08_data/fixtures/incluo-catalog-real.json \
  --tenant=incluo --gmc-default=3793

# 3. Verificar que rule link:therapeutic-claim e content:therapeutic-claim
#    estão 🟢 0 ocorrências
```

Se algum termo da Tabela 1 ainda aparecer no scorer, **não pedir re-review** — voltar para o Shopify Admin e completar.

## Próximos passos

- [ ] Samuel aplica reescrita no Shopify Admin (T0.1)
- [ ] Theme metafield ou bulk com disclaimer (T0.2)
- [ ] Página "Quem somos" reforçada (T0.3) — documento separado se necessário
- [ ] SKU normalization pgs 2/3 (T0.4) — script já existe, só rodar
- [ ] Validar com `pnpm merchant:audit` (acima)
- [ ] Solicitar re-review GMC com nota → [`re-review-note-gmc-20260527.md`](re-review-note-gmc-20260527.md)
