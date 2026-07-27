# Repositório

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
