# 04 — Sistema de confiança global

> [!warning] Registro historico - anterior a 20/08/2026
> Este documento descreve o site como ele estava na data acima. Em
> 20/08/2026 o vocabulario mudou: o termo "plataforma" saiu do site
> (a MOVECON passou a se apresentar como "autorizada pela Alpha") e o
> enquadramento de golpe/fraude foi substituido por enquadramento
> positivo. Rotas e frases citadas aqui podem nao existir mais.

> Auditoria de 2026-08-07. Por decisão sua, **valem as decisões registradas do
> projeto**. Onde o briefing pede o contrário, a divergência está registrada
> abaixo em vez de aplicada.

## 1. Divergências entre o briefing e as decisões registradas

### D1 — Faixa de confiança global com Banco Central · **NÃO IMPLEMENTAR**

O briefing (Tarefa 4) pede *"barra/faixa de confiança global (Alpha + Banco
Central + canais oficiais)"* em todas as páginas. A decisão de 25/07 diz o oposto,
textualmente:

> *"Citar o Banco Central **apenas onde a Alpha é citada** — não é elemento
> recorrente do site. **Sem selo no header, sem faixa repetida entre seções.**
> A prova de regulação se concentra na página-âncora `/administrado-pela-alpha`;
> no rodapé global vai só uma linha curta com link para ela."*

**Por que a decisão original é a melhor das duas.** A MOVECON não é autorizada
pelo Banco Central — a Alpha é. Uma faixa global repetindo "Banco Central" em
115 páginas produz exatamente a leitura que o compliance do projeto existe para
impedir: que a MOVECON é a entidade regulada. O ganho de confiança é aparente; o
risco regulatório é real.

**O que faz o mesmo trabalho sem o risco:** o componente C2 abaixo, escopado às
páginas de confiança em vez de global.

### D2 — "Operação white-label" como enquadramento · **ESCOPO RESTRITO**

Decisão de 26/07: o termo tem **escopo por audiência** — permitido em
`/quem-somos/`, `/seja-um-representante/` e página de autor; **proibido em toda
página de consumidor**. O posicionamento registrado é *"plataforma de
consórcio"*. Nenhuma copy deste documento usa o termo.

### D3 — "Sem entrada" banido · **REGRA DO PROJETO É MAIS PRECISA**

O briefing proíbe o termo de todo. O projeto tem o detector `SEM_ENTRADA`, que o
**permite desde que a ressalva da primeira parcela maior esteja no mesmo bloco**.
Banir de todo é pior: o termo é o que o público busca, e a ressalva no mesmo
bloco é o que torna a frase honesta. Mantida a regra do projeto.

### D4 — Crelider como referência do "mesmo grupo" · **NÃO APLICÁVEL**

O projeto trata MOVECON como operação separada, e o léxico da Crelider
("comparamos", "indicamos", "administradoras parceiras") é proibido aqui: a
Crelider é consultoria que compara administradoras, a MOVECON é o próprio
produto. Nenhuma copy abaixo reaproveita esse vocabulário.

---

## 2. Componentes propostos

### C1 — Rodapé global: completar, não refazer

O rodapé atual **já tem** o que mais importa: atribuição completa à Alpha, Cert.
BCB, os dois CNPJs, endereço e link para a página-âncora. Medido, não presumido.

Falta:

| Elemento | Estado | Bloqueio |
|---|---|---|
| Telefone | ausente | **dado seu** — não existe telefone comercial definido |
| WhatsApp | ausente | **dado seu** — hoje o site usa o WhatsApp da Crelider como provisório |
| Política de Privacidade | ausente | a página não existe — revisão jurídica (P5) |
| Termos de Uso | ausente | idem |

```html
<div class="mv-rodape__canais">
  <a href="tel:+55[DADO A CONFIRMAR COM SAMUEL]">[DADO A CONFIRMAR COM SAMUEL]</a>
  <a href="https://wa.me/55[DADO A CONFIRMAR COM SAMUEL]" rel="noopener">WhatsApp</a>
  <a href="mailto:contato@moveconconsorcio.com">contato@moveconconsorcio.com</a>
</div>
<nav class="mv-rodape__legal-links" aria-label="Links legais">
  <a href="/politica-de-privacidade/">Política de Privacidade</a>
  <a href="/termos-de-uso/">Termos de Uso</a>
</nav>
```

**Onde:** `_codigo/movecon-header-footer.php`.
**Não publicar os links legais antes das páginas existirem** — link para 404 é
pior do que ausência.

> ⚠️ **Prioridade real:** o site coleta dados por formulário **sem política de
> privacidade publicada**. Isso é exposição de LGPD ativa hoje, e é o item mais
> urgente deste documento inteiro. Não depende de design: depende da revisão
> jurídica destravar.

---

### C2 — "Quem faz o quê" · substitui a faixa global do briefing

Bloco escopado, **não global**. Resolve a mesma objeção sem repetir Bacen em 115
páginas.

```html
<section class="sec sec--alt" aria-labelledby="mv-fronteira-t">
  <div class="wrap stack-l">
    <h2 id="mv-fronteira-t">Quem faz o quê</h2>
    <div class="cards cards--2">
      <div class="card">
        <h3>A MOVECON</h3>
        <p>Apresenta os grupos, explica os custos por escrito e acompanha
           você do primeiro contato até a carta de crédito.</p>
      </div>
      <div class="card">
        <h3>A Alpha</h3>
        <p>Administra os grupos, realiza as assembleias e responde pela
           gestão do consórcio. Alpha Administradora de Consórcio Ltda.,
           CNPJ 90.982.679/0001-54, autorizada pelo Banco Central
           (Cert. BCB 03/100/213/88).</p>
      </div>
    </div>
    <p class="nota"><a href="/administrado-pela-alpha/">Como verificar essa
       autorização no site do Banco Central</a></p>
  </div>
</section>
```

**Onde inserir:** `/administrado-pela-alpha/`, `/seguranca/`, `/quem-somos/` e os
9 hubs. **Não** nas 36 filhas, nos guias nem nos artigos — lá a atribuição curta
do corpo já cumpre o papel, e repetir o bloco vira ruído.

Acompanha o ativo `fronteira-movecon-alpha.webp` (ver `03-gap-imagens.md` §3.2).

---

### C3 — Canal direto na página · o buraco de conversão

Medição: telefone em **0 de 115** páginas, WhatsApp em **4 de 115**. O visitante
convencido no meio de um hub não tem o que fazer.

```html
<aside class="mv-canal" aria-label="Falar com a MOVECON">
  <p>Dúvida sobre <strong>[MODALIDADE]</strong>? Fale com um consultor.</p>
  <div class="botoes">
    <a class="btn btn--cta" href="https://wa.me/55[A CONFIRMAR]" rel="noopener">
      Falar no WhatsApp</a>
    <a class="btn btn--ghost" href="/contato/">Outros canais</a>
  </div>
</aside>
```

**Onde:** hubs, filhas e simuladores, **após o último bloco de conteúdo e antes
da FAQ**. Não é barra fixa, não é pop-up, não é exit intent — nada disso combina
com um site cuja tese é sobriedade.

**Dependência:** WhatsApp próprio da MOVECON. Hoje o número em uso é da Crelider.

---

### C4 — Bloco de depoimentos · estrutura pronta, conteúdo bloqueado

Prova social é **0 de 115**. É a lacuna mais cara do relatório 02 e a única que
nenhuma edição de código resolve.

```html
<section class="sec" aria-labelledby="mv-dep-t">
  <div class="wrap stack-l">
    <h2 id="mv-dep-t">Quem já contratou pela MOVECON</h2>
    <div class="cards cards--3">
      <figure class="card card--depoimento">
        <blockquote><p>[DEPOIMENTO REAL]</p></blockquote>
        <figcaption>
          <strong>[NOME REAL]</strong>
          <span>[CIDADE/UF] · consórcio de [MODALIDADE] · [MÊS/ANO]</span>
        </figcaption>
      </figure>
    </div>
  </div>
</section>
```

**Três regras inegociáveis**, herdadas do compliance do projeto:

1. **Depoimento real, com pessoa identificável.** Sem nome e cidade, não publica.
2. **Nenhum depoimento menciona prazo de contemplação** — vira promessa por
   procuração.
3. **Nada de reaproveitar avaliação da Crelider.** É outra empresa.

**Onde:** `/avaliacoes/` primeiro. Só depois home e hubs. **Não publicar com
placeholder** — bloco de depoimento vazio é pior do que bloco ausente.

**Dependência: clientes reais.** `[DADO A CONFIRMAR COM SAMUEL]` — existe algum
contrato fechado cujo cliente autorizaria depoimento nominal?

---

### C5 — FAQ de objeções de confiança

76 de 115 páginas já têm FAQ. Falta a FAQ **sobre a própria empresa** — as
perguntas que o visitante desconfiado faz.

| Pergunta | Resposta (compliance-safe) |
|---|---|
| **A MOVECON é confiável?** | A MOVECON é uma plataforma de consórcio. Os grupos que apresentamos são administrados pela Alpha Administradora de Consórcio Ltda., CNPJ 90.982.679/0001-54, autorizada pelo Banco Central (Cert. BCB 03/100/213/88). Você pode verificar essa autorização direto no site do Banco Central — mostramos o caminho em /administrado-pela-alpha/. |
| **Quem administra meu consórcio?** | A Alpha. Ela realiza as assembleias, faz a gestão do grupo e responde pela administração. A MOVECON apresenta os grupos, explica os custos e acompanha você. |
| **Para quem eu pago?** | Sempre para a conta do grupo, mantida pela administradora. Nunca para a conta de uma pessoa física. Se alguém pedir depósito em conta pessoal, não é a MOVECON. |
| **Quanto custa?** | Consórcio não tem juros, mas tem taxa de administração, definida em contrato e informada antes de você assinar. [PERCENTUAL — DADO A CONFIRMAR: depende da tabela vigente da Alpha, pendência P1] |
| **Quando eu sou contemplado?** | Por sorteio ou por lance, nas assembleias do grupo. Não há prazo garantido, e quem promete prazo está mentindo. |

A última resposta é a mais valiosa do conjunto: transformar a objeção em
diferencial anti-golpe é a estratégia declarada do posicionamento.

**Onde:** `/seguranca/` e `/quem-somos/`, com as duas primeiras replicadas na FAQ
dos hubs.

---

## 3. O que não proponho, e por quê

| Componente | Por que não |
|---|---|
| Faixa de confiança global com Bacen | D1 — contraria decisão registrada e cria risco regulatório |
| Selos de certificação | a MOVECON não tem nenhum; selo inventado é o oposto de confiança |
| Contador de clientes / anos de mercado | empresa aberta em 17/06/2026; qualquer número seria fabricado |
| Barra fixa de WhatsApp | conflita com a sobriedade que sustenta a credibilidade do site |
| Selo "site seguro" / cadeado desenhado | o HTTPS real já aparece no navegador; desenhar cadeado é teatro |
