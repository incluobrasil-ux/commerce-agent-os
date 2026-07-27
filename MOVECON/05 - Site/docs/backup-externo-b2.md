# Backup externo — passo a passo do Backblaze B2

> **Tudo do lado do servidor já está pronto.** Falta só a credencial. Quando o
> arquivo `/etc/movecon-backup.env` existir, o envio passa a acontecer no
> próximo backup diário, às 03:20.

## Por que B2 e não R2

Os dois são S3-compatíveis e servem. **B2 ganha em uma coisa que importa aqui:**
a chave de aplicação tem lista de capacidades granular, e dá para criar uma que
**escreve e lista mas não apaga**. No R2, o token mais restrito ainda inclui
delete junto com write.

Uma credencial que não apaga não consegue destruir o histórico — que é
exatamente o cenário contra o qual o backup externo existe. Se a chave vazar do
servidor, o pior que acontece é alguém escrever lixo no bucket; os backups
antigos continuam lá.

## O que criar no painel

### 1. Conta e bucket

1. Crie conta em `backblaze.com/cloud-storage` (o plano gratuito cobre 10 GB — o backup atual tem 550 KB por dia, ~6 MB retidos).
2. **Buckets → Create a Bucket**
   - Nome: `movecon-backup` (precisa ser único no B2; se estiver tomado, use `movecon-backup-` mais algo)
   - **Files in Bucket are: Private**
   - Default Encryption: **Enable**
   - Object Lock: **Disable** (com chave sem delete já não precisamos)
3. Anote a **região** que aparece no endpoint, algo como `us-west-004`.

### 2. Chave de aplicação com escopo mínimo

**App Keys → Add a New Application Key**

| Campo | Valor |
|---|---|
| Name of Key | `movecon-vps-backup` |
| Allow access to Bucket | **`movecon-backup`** — nunca "All" |
| Type of Access | **Read and Write** |
| Allow List All Bucket Names | **desmarcado** |
| File name prefix | deixe vazio |
| Duration | deixe vazio (sem expiração) |

Depois de criar, **desmarque a capacidade `deleteFiles`** se o painel oferecer a
edição. Se não oferecer, tudo bem — o resto das travas continua valendo.

A tela mostra **uma única vez**:

- `keyID` — algo como `004abc123...`
- `applicationKey` — a chave longa

**Copie os dois agora.** Fechada a tela, não dá para ver de novo.

### 3. O endpoint

Em **Buckets**, o bucket mostra um endpoint como:

```
s3.us-west-004.backblazeb2.com
```

O que vamos usar é ele com `https://` na frente.

## Onde colocar a chave

**Me mande os quatro valores** e eu crio o arquivo. Ou execute você mesmo, por
SSH no servidor:

```bash
cat > /etc/movecon-backup.env <<'EOF'
B2_KEY_ID=004abc123...
B2_APP_KEY=K004xxxxxxxxxxxxxxxx
B2_BUCKET=movecon-backup
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_REGION=us-west-004
EOF
chmod 600 /etc/movecon-backup.env
```

**Permissão 600 e fora do git.** O arquivo nunca é versionado — é por isso que o
script lê dele em vez de trazer a chave embutida.

## O que já está pronto no servidor

- `backup-movecon.sh` com o trecho de envio, instalado e com sintaxe validada
- Cliente AWS em container `amazon/aws-cli:2.17.0`, imagem já baixada — o pacote
  `awscli` não existe nos repositórios deste servidor, e assim nada é adicionado
  ao sistema
- **Degradação testada:** sem o arquivo de credencial, o backup local roda
  normalmente e o log registra `AVISO: /etc/movecon-backup.env nao existe`.
  Falha de envio nunca derruba o backup em si.

## A verificação que fecha a P8

O script não confia em "o comando não deu erro". Depois de enviar, ele faz
`head-object` no bucket e **compara o tamanho com o arquivo local**. Se
divergir, sai com erro e mantém a cópia local.

Envio que "deu certo" mas gravou zero byte é o modo de falha silencioso clássico
de backup remoto — e só aparece no dia em que você precisa restaurar.

Para fechar a P8, com a credencial no lugar:

```bash
/usr/local/bin/backup-movecon.sh
tail -5 /var/log/backup-movecon.log
```

Espere ver, em sequência:

```
enviado: s3://movecon-backup/diario/movecon-AAAA-MM-DD.tar.gz
verificado no bucket: NNNNNN bytes, igual ao local
envio externo concluido
```

Com isso, **P8 fecha**: código no repositório privado, estado no bucket externo,
e restore já testado.
