# Reconciliação da branch `pc2-trabalho` — rodar na MÁQUINA PRINCIPAL

> **Contexto.** A branch `pc2-trabalho` foi criada num clone defasado do
> `movecon-site` (HEAD `516b255`, 2026-07-26 21:49). Ela contém **apenas trabalho
> aditivo**: o `estado-do-projeto.md` (mapa de estado) e este próprio arquivo.
> Nenhum arquivo de conteúdo foi tocado no clone.
>
> **Onde rodar.** Na máquina principal, dentro do monorepo
> `C:\projetos-incluo\commerce-agent-os\`, onde vivem os commits pendentes do
> MOVECON e o remote `movecon` (subtree). **Não rode este bloco no clone.**
>
> **Pré-condição.** Working tree limpo (`git status` sem pendências) e um baseline
> commitado — regra de ouro do HANDOFF: nada de passada grande sem commit antes.

## (a) Subtree push dos commits pendentes do MOVECON para `main`

Sobe todo o trabalho local que ainda não foi enviado (a origem da defasagem).

```bash
cd /c/projetos-incluo/commerce-agent-os        # ajuste se o path for outro

git status                                     # tem que estar limpo
git log --oneline origin/main..HEAD | head     # conferir o que vai subir

# empurra o subtree MOVECON/ para o repo movecon-site (branch main)
git subtree push --prefix=MOVECON movecon main
```

Se `movecon` não estiver configurado como remote:

```bash
git remote add movecon https://github.com/incluobrasil-ux/movecon-site.git
git subtree push --prefix=MOVECON movecon main
```

Ao final, `movecon-site` `origin/main` deixa de estar em `516b255` e passa a
refletir o estado real da máquina principal.

## (b) Trazer a `pc2-trabalho` e mergear em `main`

Regra de conflito: **conteúdo → máquina principal vence; relatório → `pc2` vence.**

```bash
# trabalhar num clone/checkout do movecon-site standalone
cd /caminho/para/movecon-site
git fetch origin
git checkout main
git pull --ff-only origin main                 # já traz o resultado do passo (a)
git merge --no-ff origin/pc2-trabalho -m "merge(movecon): incorpora relatorio de estado da pc2-trabalho"
```

Se houver conflito, resolver por natureza do arquivo:

```bash
# arquivos de conteudo (segmentos.json, artigos, guias, _codigo, keyword-map):
#   a maquina principal esta correta -> manter a versao de main
git checkout --ours   -- "05 - Site/content" "05 - Site/_codigo"

# o relatorio de estado -> a pc2 e a fonte
git checkout --theirs -- "05 - Site/docs/estado-do-projeto.md" \
                         "05 - Site/docs/reconciliacao-pc2-para-maquina-principal.md"

git add -A
git commit --no-edit
```

> Espera-se **zero conflito de conteúdo**: no clone só foram criados 2 arquivos
> novos em `docs/`. Se aparecer conflito fora de `docs/`, PARE — significa que
> algo além de trabalho aditivo entrou na `pc2`, contra a regra da branch.

## (c) Rebaixar os marcadores `⟳` do relatório contra o estado real

Abrir `05 - Site/docs/estado-do-projeto.md`, §5 (Divergências). Para **cada**
linha marcada `⟳`, achar o commit da máquina principal que fez o trabalho e
decidir:

| Marcador | Verificação na principal | Vira |
|---|---|---|
| **D1** autor Samuel Tanan / `/autor/` | `git log --oneline -- MOVECON/…` procurando `/autor/`; `grep -r samuel-tanan` | "concluído, commit `X`" **ou** pendência real se ainda não feito |
| **D2** 14 artigos Fase 2 | contar rotas `camada: artigo` no `keyword-map.json` atual | idem |
| **D3** 94/94 atribuição no corpo | `check_seo`/grep de bloco de compliance no corpo dos hubs | idem |
| **D4** fontes primárias + data nos guias | grep de `<a href` de fonte e data nos `guias-*.json` | idem (e resolver 20 vs 21) |
| **D5** molde de hub aprovado (3 blocos, FAQ 6→8) | diff de `segmentos.json` / `/consorcio-imoveis/` | idem |
| **D6** detectores `ESCOPO_TERMO` + `PAGINA_VAZIA` | `grep -n ESCOPO_TERMO scripts/check_seo.py` (ou módulo novo) | idem |
| **D7** módulo `compliance.py` | `ls scripts/compliance.py` — confirmar o nome real | corrigir a referência |
| **D9** regime molde→lote / fila veículos+caminhão | `06-pendencias.md` atual | idem |

Regra: `⟳` que corresponde a trabalho **já feito** vira **"concluído — commit
`X`"**; o que **sobrar** é **pendência real** e sobe para as seções §3/§4.
Atualizar também o placar (§1) e a proveniência (novo HEAD/hash) com os números
reais da principal.

Fechar D8 **no ar** (só verificável em produção, gerado pelo mu-plugin):

```bash
curl -sS -o /dev/null -w "%{http_code}  %{url_effective}\n" https://moveconconsorcio.com/llms.txt
curl -sS -o /dev/null -w "%{http_code}  %{url_effective}\n" https://moveconconsorcio.com/sitemap-movecon.xml
curl -sS -o /dev/null -w "%{http_code}  %{url_effective}\n" https://moveconconsorcio.com/robots.txt
```

Esperado: `200` nos três. Registrar no relatório a contagem de URLs do sitemap e
a data da verificação, rebaixando D8.

## (d) Apagar a branch `pc2-trabalho` após o merge

```bash
git branch -d pc2-trabalho                     # local, se existir
git push origin --delete pc2-trabalho          # remota no movecon-site
```

## (e) Commit + push final do relatório reconciliado

```bash
git add "05 - Site/docs/estado-do-projeto.md"
git commit -m "docs(movecon): reconcilia estado-do-projeto apos subtree push (rebaixa marcadores)"
git push origin main
# e, se o relatorio vive no monorepo, subir tambem por la:
# cd /c/projetos-incluo/commerce-agent-os && git subtree push --prefix=MOVECON movecon main
```

## Registro no manual (pendente — fazer na principal)

Adicionar em `repositorio.md` (ou no HANDOFF), como **passo obrigatório de
fechamento de cada sessão**:

> **Ao fim de cada sessão de trabalho, rodar `git subtree push --prefix=MOVECON
> movecon main`.** Enquanto não roda, o código só existe local — foi a situação
> que gerou os 57 commits nunca enviados e a defasagem que exigiu esta
> reconciliação. O relatório `estado-do-projeto.md` também se atualiza ao fim de
> cada item concluído.

*(Não editado aqui de propósito: `repositorio.md` é arquivo pré-existente e esta
máquina está em regime aditivo. Fazer a edição na principal, onde o arquivo está
atual.)*
