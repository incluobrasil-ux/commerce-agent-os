# Repositório

## Passo obrigatório de fechamento de sessão

**Registrado em 27/07/2026, depois da reconciliação da `pc2-trabalho`.**

```bash
git subtree push --prefix=MOVECON movecon main
```

**Enquanto não roda, o código só existe na máquina local.** Foi essa a situação
duas vezes:

| Quando | Sintoma |
|---|---|
| 26/07 | 57 commits nunca enviados; último no remoto datava de 28/05 |
| 27/07 | 12 commits parados desde 26/07 21:49 — P3, os 14 artigos, os guias, o bloco de compliance e a engorda dos hubs |

O segundo caso custou uma reconciliação inteira: outra máquina clonou o remoto
defasado, produziu um relatório de estado com nove divergências, e os nove eram
o mesmo problema — commit não enviado.

**O `estado-do-projeto.md` também se atualiza ao fim de cada item concluído.**

### O clone é o repositório de trabalho — subtree aposentado para push

**Decisão do cliente em 27/07/2026.** Não houve force-push: o registro do merge
da `pc2-trabalho` e o commit da reconciliação ficam no histórico.

| | |
|---|---|
| **Repositório de trabalho** | clone standalone do `movecon-site` |
| **Subtree do monorepo** | **aposentado para push** — serve como histórico e como cópia de trabalho dos arquivos |
| **Regra de fim de sessão** | `git push` simples, do clone |

**Por que.** Dois commits nasceram fora do subtree — o merge da `pc2-trabalho` e
o da reconciliação —, feitos no clone porque o roteiro assim determinava. O
`git subtree split` do monorepo não os conhece, então `subtree push` é rejeitado
por não-fast-forward e `subtree pull` recusa históricos não relacionados.
Rebaselinar com `--force` restabeleceria o comando único, mas descartaria do
remoto justamente o registro de como a reconciliação foi feita.

### Publicar

```bash
cd <clone do movecon-site>
git pull --ff-only origin main
# copiar de MOVECON/ para o clone o que mudou
git add -A && git commit && git push origin main
```

### A trava contra a terceira ocorrência

`scripts/verificar_sync.py` compara o **conteúdo** — hash de cada arquivo —
entre `MOVECON/` e o `movecon-site`. Compara conteúdo e não contagem de commits
de propósito: contagem diverge por rebase e por merge sem que nada esteja
errado; conteúdo, não.

```bash
python scripts/verificar_sync.py          # exit 1 se divergir
python scripts/verificar_sync.py --aviso  # só informa
```

Instalado como **`post-commit`** (cópia versionada em `_codigo/hooks/`): todo
commit que toca `MOVECON/` dispara a checagem e imprime o que falta publicar,
com o comando pronto. Não bloqueia — o commit já aconteceu, e travar depois do
fato não ajuda. O objetivo é que o autor **veja**: nas duas ocorrências
anteriores nada quebrou e nada avisou, e foi exatamente por isso que o trabalho
ficou parado.

Para instalar num checkout novo:

```bash
cp "MOVECON/05 - Site/_codigo/hooks/post-commit" .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

### Se outra máquina trabalhar em paralelo

A regra que funcionou: a máquina defasada opera em **regime aditivo** — só
arquivos novos, nunca editar conteúdo existente — numa branch própria. O merge
depois é trivial e a regra de conflito fica clara de antemão: **conteúdo → a
máquina principal vence; relatório → a branch de origem vence.**

## Onde o código vive

| Repositório | Visibilidade | Contém MOVECON |
|---|---|---|
| `incluobrasil-ux/commerce-agent-os` | **público** | **não, e não deve** |
| `incluobrasil-ux/movecon-site` | **privado** | sim — é o backup externo do código |

O trabalho acontece dentro do monorepo, em `MOVECON/`. O repositório privado
recebe uma cópia com histórico próprio, extraída por `git subtree`.

**Por que não tornar o monorepo privado:** decisão do cliente em 26/07/2026 —
`commerce-agent-os` tem outros usos que dependem dele ser público. Mudar
visibilidade afetaria tudo.

## Enviar o trabalho para o repositório privado

```bash
cd c:/projetos-incluo/commerce-agent-os
git subtree push --prefix=MOVECON movecon main
```

Isso reescreve o histórico de `MOVECON/` como se fosse a raiz e envia. Sem
argumento adicional, o remoto `movecon` já aponta para o repositório privado.

**Rode isso a cada sessão de trabalho.** Enquanto não rodar, o código só existe
na máquina local — foi exatamente essa a situação encontrada em 26/07/2026, com
57 commits nunca enviados e o último no remoto datado de 28/05.

### Se o subtree push ficar lento

Em histórico grande ele reprocessa tudo. A alternativa é refazer o split:

```bash
git branch -D movecon-only
git subtree split --prefix=MOVECON -b movecon-only
git push movecon movecon-only:main --force-with-lease
```

`--force-with-lease` e não `--force`: se alguém tiver enviado algo ao privado
que você não tem, o push falha em vez de destruir.

## Antes de qualquer push — sempre

```bash
gitleaks detect --log-opts="movecon-only" --no-banner --redact
```

Rodado em 26/07/2026 sobre os 40 commits: **nenhum segredo**.

O que existe e é esperado num repositório **privado**: CNPJ da MOVECON e da
Alpha, certificado Bacen, IP do servidor, caminho da chave SSH e as decisões
internas de compliance. Nada disso é credencial, mas nada disso vai para
repositório público.

## O que NÃO deve estar versionado

- `05 - Site/scripts/__pycache__/` — há 1 `.pyc` no histórico. Não é risco, é
  sujeira. Adicionar ao `.gitignore` do monorepo.
- Qualquer arquivo com chave de API. O backup lê a credencial de
  `/etc/movecon-backup.env` **no servidor**, que nunca entra no git.

## Restauração do código

O repositório privado é o backup do código. Para restaurar:

```bash
git clone https://github.com/incluobrasil-ux/movecon-site.git
```

Os mu-plugins vão para `wp-content/mu-plugins/`, os JSONs para
`wp-content/movecon/`, e as páginas se regeneram pelos scripts. O
`docs/backup-restore.md` cobre a outra metade — banco, uploads e configs.
