#!/bin/bash
#
# backup-movecon.sh — backup diário do que NÃO está no git.
#
# O código (mu-plugins, scripts, JSONs, /docs/) vive no repositório e não entra
# aqui: duplicar backup de coisa versionada é desperdício e cria duas fontes da
# verdade sobre o mesmo arquivo.
#
# Aqui entra só o que existe apenas no servidor:
#   - dump do banco (páginas, menus, opções, CSS do customizer)
#   - wp-content/uploads (mídia enviada pelo painel)
#   - configs do servidor (Caddyfile, docker-compose, wp-config)
#
# RETENÇÃO: 7 diários + 4 semanais. O semanal é o de domingo, promovido para
# uma pasta que a limpeza diária não toca.
#
# DESTINO EXTERNO: este script grava LOCALMENTE. O envio para fora do VPS é o
# passo que depende de credencial do cliente — enquanto ele não existir, o
# backup protege contra erro humano e corrupção de banco, MAS NÃO contra perda
# do disco. Isso está documentado em /docs/backup-restore.md.
#
set -euo pipefail

DEST=/opt/backups/movecon
DIA=$(date +%F)
SEMANA=$(date +%G-W%V)
DOW=$(date +%u)          # 7 = domingo
LOG=/var/log/backup-movecon.log

mkdir -p "$DEST/diario" "$DEST/semanal"

log() { echo "[$(date '+%F %T')] $*" >> "$LOG"; }

log "início do backup $DIA"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# --- banco -----------------------------------------------------------------
# mariadb-dump, e não mysqldump: a imagem mariadb:11 não traz o nome antigo.
SENHA=$(docker exec movecon_db printenv MARIADB_ROOT_PASSWORD 2>/dev/null \
     || docker exec movecon_db printenv MYSQL_ROOT_PASSWORD)
BANCO=$(docker exec movecon_db printenv MARIADB_DATABASE 2>/dev/null \
     || docker exec movecon_db printenv MYSQL_DATABASE)

docker exec movecon_db mariadb-dump \
  -uroot -p"$SENHA" \
  --single-transaction --quick --default-character-set=utf8mb4 \
  "$BANCO" > "$TMP/banco.sql"

LINHAS=$(wc -l < "$TMP/banco.sql")
if [ "$LINHAS" -lt 100 ]; then
  log "ERRO: dump com apenas $LINHAS linhas — abortando sem sobrescrever"
  exit 1
fi

# --- uploads ---------------------------------------------------------------
docker cp movecon_wp:/var/www/html/wp-content/uploads "$TMP/uploads" 2>/dev/null || true

# --- configs do servidor ---------------------------------------------------
mkdir -p "$TMP/configs"
for f in /opt/crm/infra/Caddyfile /opt/crm/infra/docker-compose.yml \
         /root/wpcli-movecon.sh; do
  [ -f "$f" ] && cp "$f" "$TMP/configs/$(basename "$f")" || true
done
docker exec movecon_wp cat /var/www/html/wp-config.php > "$TMP/configs/wp-config.php" 2>/dev/null || true

# --- empacota --------------------------------------------------------------
ARQ="$DEST/diario/movecon-$DIA.tar.gz"
tar -czf "$ARQ" -C "$TMP" .
chmod 600 "$ARQ"

TAM=$(du -h "$ARQ" | cut -f1)
log "gerado $ARQ ($TAM, dump com $LINHAS linhas)"

# --- promoção semanal ------------------------------------------------------
if [ "$DOW" = "7" ]; then
  cp "$ARQ" "$DEST/semanal/movecon-$SEMANA.tar.gz"
  log "promovido para semanal: movecon-$SEMANA.tar.gz"
fi

# --- retenção --------------------------------------------------------------
ls -1t "$DEST/diario"/movecon-*.tar.gz  2>/dev/null | tail -n +8 | xargs -r rm -f
ls -1t "$DEST/semanal"/movecon-*.tar.gz 2>/dev/null | tail -n +5 | xargs -r rm -f

log "retenção aplicada: $(ls -1 "$DEST/diario" | wc -l) diários, $(ls -1 "$DEST/semanal" | wc -l) semanais"
#!/bin/bash
#
# Trecho de envio externo, acrescentado ao fim de backup-movecon.sh.
#
# Le a credencial de /etc/movecon-backup.env, que NUNCA entra no git e tem
# permissao 600. Se o arquivo nao existir, o backup local continua funcionando
# e o log registra que o envio nao aconteceu - falha de envio nunca derruba o
# backup em si.
#
# Escopo minimo da chave: escrever e listar, SEM apagar. Se a credencial nao
# puder apagar, um invasor que a obtenha nao consegue destruir o historico -
# que e exatamente o cenario contra o qual o backup externo existe.

#!/bin/bash
#
# Envio externo do backup para bucket S3-compativel.
#
# Usa o cliente AWS em container: o pacote awscli nao existe nos repositorios
# deste servidor, e o Docker ja esta instalado. Assim nada e adicionado ao
# sistema e a versao do cliente fica fixada.
#
# Le a credencial de /etc/movecon-backup.env, que NUNCA entra no git e tem
# permissao 600. Sem o arquivo, o backup local continua e o log registra que o
# envio nao aconteceu - falha de envio nao derruba o backup.
#
# Escopo minimo da chave: escrever e listar, SEM apagar. Uma credencial que nao
# apaga nao consegue destruir o historico - que e o cenario contra o qual o
# backup externo existe.

CRED=/etc/movecon-backup.env

if [ ! -f "$CRED" ]; then
  log "AVISO: $CRED nao existe - backup gravado apenas localmente"
  log "fim"
  exit 0
fi

# shellcheck disable=SC1090
. "$CRED"
: "${B2_KEY_ID:?}" "${B2_APP_KEY:?}" "${B2_BUCKET:?}" "${B2_ENDPOINT:?}"

IMG=amazon/aws-cli:2.17.0

s3() {
  docker run --rm \
    -e AWS_ACCESS_KEY_ID="$B2_KEY_ID" \
    -e AWS_SECRET_ACCESS_KEY="$B2_APP_KEY" \
    -e AWS_DEFAULT_REGION="${B2_REGION:-us-east-005}" \
    -v "$DEST:/backup:ro" \
    "$IMG" --endpoint-url "$B2_ENDPOINT" "$@"
}

NOME=$(basename "$ARQ")

if s3 s3 cp "/backup/diario/$NOME" "s3://$B2_BUCKET/diario/$NOME" \
     --only-show-errors; then
  log "enviado: s3://$B2_BUCKET/diario/$NOME"
else
  log "ERRO: falha no envio - copia local mantida"
  exit 1
fi

# Verificacao de ida e volta. Envio que "nao deu erro" mas gravou zero byte e o
# modo de falha silencioso classico de backup remoto.
TAM_LOCAL=$(stat -c%s "$ARQ")
TAM_REMOTO=$(s3 s3api head-object --bucket "$B2_BUCKET" \
              --key "diario/$NOME" --query ContentLength --output text 2>/dev/null | tr -d '\r')

if [ "$TAM_LOCAL" = "$TAM_REMOTO" ]; then
  log "verificado no bucket: $TAM_REMOTO bytes, igual ao local"
else
  log "ERRO: tamanho divergente - local $TAM_LOCAL, remoto ${TAM_REMOTO:-ausente}"
  exit 1
fi

if [ "$DOW" = "7" ]; then
  s3 s3 cp "/backup/semanal/movecon-$SEMANA.tar.gz" \
    "s3://$B2_BUCKET/semanal/movecon-$SEMANA.tar.gz" --only-show-errors \
    && log "semanal enviado: movecon-$SEMANA.tar.gz"
fi

log "envio externo concluido"
log "fim"
