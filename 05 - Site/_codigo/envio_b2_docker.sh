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
