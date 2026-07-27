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
log "fim"
