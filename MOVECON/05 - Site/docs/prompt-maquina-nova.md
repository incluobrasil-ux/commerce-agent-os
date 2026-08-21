# Prompt para subir o projeto MOVECON numa máquina nova

> Cole o bloco abaixo no Claude Code, dentro da pasta onde você quer o projeto.
> Ele foi escrito para ser colado inteiro, de uma vez.

---

## O prompt

````
Você vai preparar esta máquina para trabalhar no site da MOVECON. Execute na
ordem e PARE se algum passo falhar — não improvise contorno.

## 1. Verifique o que já existe

Rode e me mostre o resultado:

    git --version
    python --version
    ls ~/.ssh/

Requisitos: git, Python 3.9 ou superior. Os scripts do projeto usam SOMENTE a
biblioteca padrão do Python — não há nada para instalar via pip.

## 2. Clone o repositório de trabalho

    git clone https://github.com/incluobrasil-ux/movecon-site.git
    cd movecon-site

É repositório PRIVADO. Se pedir autenticação, use um Personal Access Token do
GitHub com escopo `repo`.

O projeto vive em `05 - Site/` — repare no espaço no nome da pasta: sempre
entre aspas nos comandos.

## 3. Leia a base antes de tocar em qualquer coisa

Leia nesta ordem e me faça um resumo de 10 linhas do que entendeu:

    05 - Site/docs/estado-do-projeto.md     ← onde o projeto está
    05 - Site/docs/repositorio.md           ← como publicar, e a regra de fim de sessão
    05 - Site/docs/01-compliance.md         ← as regras que não se negociam
    05 - Site/docs/04-padroes-onpage.md     ← os padrões de conteúdo e os detectores

Não pule esta etapa. As regras de compliance deste projeto não são preferência
de estilo: MOVECON nunca é descrita como administradora, nunca se promete
contemplação, e nenhum número entra no site sem fonte.

## 4. Confirme que os validadores rodam

    cd "05 - Site"
    python scripts/check_seo.py

Esperado: `[OK] Arquitetura integra` e a contagem de rotas. Se acusar erro,
PARE e me mostre — o validador quebrar significa que algo está fora do lugar,
não que ele deva ser afrouxado.

Rode também, para ver os geradores funcionando sem publicar nada:

    python scripts/gerar_hubs.py
    python scripts/gerar_filhas.py
    python scripts/gerar_guias.py

Eles escrevem em `build/`, que é descartável.

## 5. Acesso ao servidor — só se você for publicar

O site roda num VPS. Para PUBLICAR você precisa de uma chave SSH autorizada; para
escrever conteúdo e rodar geradores, NÃO precisa.

Se você vai publicar, gere SUA própria chave e me diga a pública, para eu
autorizá-la — não use a chave de outra pessoa:

    ssh-keygen -t ed25519 -C "movecon-<seu-nome>"
    cat ~/.ssh/id_ed25519.pub

Depois de autorizada, teste:

    python scripts/check_seo.py --wp

Sem chave, esse comando avisa que pulou a checagem e segue — é o esperado.

## 6. Instale o hook que evita trabalho perdido

    cp "05 - Site/_codigo/hooks/post-commit" .git/hooks/post-commit
    chmod +x .git/hooks/post-commit

Ele avisa quando há trabalho commitado e ainda não publicado. Existe porque isso
já aconteceu duas vezes no projeto — 57 commits parados numa vez, 12 na outra, e
nas duas nada quebrou e nada avisou.

ATENÇÃO: `scripts/verificar_sync.py` foi escrito para o layout do monorepo e
procura a pasta `commerce-agent-os` dois níveis acima. Num clone standalone ele
não encontra e a checagem não funciona. Me avise quando chegar aqui que eu
ajusto o script para os dois layouts.

## 7. Como publicar (leia antes de publicar qualquer coisa)

Este repositório é o repositório de trabalho. O fluxo é:

    git pull --ff-only origin main
    # fazer as alterações em "05 - Site/"
    git add -A && git commit && git push origin main

REGRA DE FIM DE SESSÃO: sempre dar `git push` antes de encerrar. Enquanto não
roda, o trabalho só existe nesta máquina.

Publicar no site é outro passo, feito por SSH com o wrapper `wpcli-movecon.sh`
que vive no servidor. Está documentado em `docs/repositorio.md`.

## 8. Me diga o que encontrou

Ao terminar, me responda:
- versões de git e python
- se o `check_seo.py` passou e quantas rotas ele contou
- se você tem chave SSH autorizada ou não
- qualquer passo que falhou

Não comece a alterar conteúdo antes de eu confirmar que o ambiente está certo.
````

---

## O que este prompt NÃO faz, de propósito

| | Por quê |
|---|---|
| Não instala nada global | Os scripts usam só a stdlib do Python. Instalar dependência que não existe é ruído |
| Não copia chave SSH | Chave é pessoal. Compartilhar chave é o erro de segurança mais comum em handoff |
| Não dá acesso ao servidor | Quem publica precisa de autorização explícita sua, uma chave por pessoa |
| Não publica nada | A primeira sessão numa máquina nova é para conferir o ambiente, não para mexer no site no ar |

## O que você precisa fazer do seu lado

1. **Convidar a pessoa** no repositório: `github.com/incluobrasil-ux/movecon-site` → Settings → Collaborators.
2. **Autorizar a chave SSH dela** no servidor, se ela for publicar — adicionar a chave pública em `~/.ssh/authorized_keys` do `root`. Uma chave por pessoa, nunca compartilhada.
3. **Decidir se ela precisa de acesso ao servidor.** Para escrever conteúdo e rodar geradores, não precisa.

## Antes de convidar alguém, saiba o que o repositório contém

Rodei a varredura: **nenhuma credencial** nos 229 commits — as chaves do B2 vivem em `/etc/movecon-backup.env`, fora do git. Mas está lá dentro:

- IP do servidor, usuário `root@` e o caminho da chave SSH — em `Runbook - DNS e Infra.md`, `HANDOFF.md` e `check_seo.py`
- comandos de docker e wp-cli de produção
- os scripts de backup e de envio para o B2
- análise pontuada de concorrentes nomeados
- as decisões internas de compliance

Não é senha. Mas é o mapa da operação.
