# Medição — Search Console e GA4

> **Estado em 26/07/2026:** o site está pronto para ser verificado; as
> propriedades não existem. A criação depende de conta Google do cliente.
>
> **GA4 não deve ser ativado antes da P7 (banner de consentimento).** Ver o
> aviso no fim.

## O que já está pronto

Conferido no ar em 26/07/2026:

| Item | Estado |
|---|---|
| `sitemap-movecon.xml` | **78 URLs** = exatamente as rotas indexáveis no ar |
| XML bem formado | OK |
| LPs vazando no sitemap | zero |
| URLs duplicadas | zero |
| Todas HTTPS com barra final | OK |
| `robots.txt` aponta o sitemap | OK |
| Site Kit instalado | sim, com `propertyID` vazio |

O sitemap sai de `mv_indexaveis()` no mu-plugin: rota `planejada` ou `noindex`
nunca entra. Ele não precisa de manutenção — acompanha o keyword-map sozinho.

## Passo a passo — Search Console

**Você faz. Leva uns 5 minutos.**

1. Abra `search.google.com/search-console` com a conta Google da MOVECON.
2. **Adicionar propriedade** → escolha **"Prefixo do URL"**, não "Domínio".
   O prefixo verifica por HTML e não exige mexer em DNS; o domínio exigiria um
   registro TXT no Squarespace.
3. Cole exatamente: `https://moveconconsorcio.com/`
4. Na tela de verificação, escolha **"Tag HTML"** e copie o valor do
   `content="..."` da meta que ele mostrar.
5. **Me mande esse valor.** Eu insiro no mu-plugin, publico, e você clica em
   "Verificar".
6. Verificado: **Sitemaps** no menu lateral → adicionar `sitemap-movecon.xml`.
7. **Inspeção de URL** → cole `https://moveconconsorcio.com/` → "Solicitar
   indexação". Repita para os 9 hubs. Não adianta pedir as 99: o Google limita
   e o sitemap cobre o resto.

**Por que a tag HTML e não o Site Kit:** o Site Kit faz a verificação por OAuth
e passa a depender do plugin continuar instalado e autenticado. A meta tag vive
no mu-plugin, junto com o resto do metadado, e sobrevive a qualquer mudança de
plugin.

## Passo a passo — GA4

**Não crie ainda.** Leia o aviso no fim antes.

1. `analytics.google.com` → **Administrar** → **Criar propriedade**.
2. Nome "MOVECON", fuso "(GMT-03:00) Brasília", moeda BRL.
3. Fluxo de dados → **Web** → `https://moveconconsorcio.com` → nome "Site".
4. Copie o **ID da métrica**, no formato `G-XXXXXXXXXX`.
5. Me mande. Eu insiro no mu-plugin **já condicionado ao consentimento**.

## Sequência confirmada pelo cliente em 26/07/2026

**GSC → P7 → GA4.** Nesta ordem, e não em outra.

O cliente cria a propriedade do Search Console agora, escolhendo **Prefixo do
URL** e verificação por **Tag HTML**, e me manda o valor do `content=`.

O GA4 espera a P7. GA4 sem banner de consentimento é violação de LGPD, e o
próprio plano mestre lista o GA4 como o primeiro dos quatro gatilhos que exigem
o banner.

## O que eu faço quando você me passar os valores

Um mu-plugin `movecon-medicao.php`, no mesmo padrão dos outros:

- meta de verificação do Search Console no `<head>`
- GA4 carregado **só depois do consentimento**, nunca antes
- nada em página `noindex` — LP e simulador não sujam a medição
- zero hardcode em página: tudo por hook, como manda o plano

## Aviso — a ordem importa

**GA4 antes do banner de consentimento é violação de LGPD.** O plano mestre
lista quatro gatilhos que exigem o banner, e o GA4 é o primeiro deles.

O Complianz foi desinstalado e nenhum plugin de consentimento está instalado
hoje. A P7 continua aberta.

**Sequência correta:**

1. Search Console — pode ser agora. Não coleta dado do visitante.
2. Banner de consentimento (P7) — resolve a exposição que já existe, porque o
   site capta lead por WhatsApp **sem política de privacidade publicada**.
3. GA4 — só depois de 1 e 2.

Fazer na ordem errada troca um problema de medição por um problema jurídico.
