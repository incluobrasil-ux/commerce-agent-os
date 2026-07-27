# Backup e restore

> **Estado em 26/07/2026: PARCIAL.** O backup roda e o restore foi testado, mas
> as cópias ainda estão **no mesmo VPS**. A pendência P8 só fecha quando o
> destino externo existir. Ver "O que falta" no fim.

## O que está protegido, e por onde

O projeto tem duas metades e cada uma se protege de um jeito. Duplicar não
ajuda: cria duas fontes da verdade sobre o mesmo arquivo.

| Metade | Onde vive | Como se protege |
|---|---|---|
| Código: `_codigo/`, `scripts/`, `content/*.json`, `docs/` | repositório git | commit + push para remoto externo |
| Estado: banco, uploads, configs do servidor | só no VPS | `backup-movecon.sh` |

**O banco é a parte insubstituível.** Ele guarda as 99 páginas montadas, os
menus, as opções do tema e os 41 KB de CSS do customizer. Os geradores
reconstroem o HTML, mas não reconstroem o que foi editado no painel.

## O backup

`/usr/local/bin/backup-movecon.sh`, diário às 03:20 via cron.

**Empacota:** dump do banco (`mariadb-dump --single-transaction`), `uploads/`,
e as configs — `Caddyfile`, `docker-compose.yml`, `wp-config.php`,
`wpcli-movecon.sh`.

**Retenção:** 7 diários + 4 semanais. O semanal é o de domingo, copiado para
uma pasta que a limpeza diária não toca.

**Trava de segurança:** se o dump sair com menos de 100 linhas, o script aborta
com exit 1 **sem sobrescrever nada**. Backup vazio que substitui um bom é pior
que backup nenhum — some sem avisar.

**Tamanho:** 550 KB por execução. Os 11 arquivos retidos ocupam ~6 MB.

Log em `/var/log/backup-movecon.log`, com rotação mensal e 6 gerações.

## O restore — testado em 26/07/2026

Testado em ambiente isolado, em container descartável separado do banco de
produção. **Backup sem restore testado não é backup: é esperança.**

### Procedimento executado

```bash
tar -xzf /opt/backups/movecon/diario/movecon-AAAA-MM-DD.tar.gz -C /tmp/restore-teste

docker run -d --name restore_teste_db \
  -e MARIADB_ROOT_PASSWORD=teste123 -e MARIADB_DATABASE=restore_teste mariadb:11

docker exec -i restore_teste_db mariadb -uroot -pteste123 restore_teste \
  < /tmp/restore-teste/banco.sql
```

### O que foi verificado

| Verificação | Resultado |
|---|---|
| Páginas publicadas | **99** — bate com produção |
| Hubs de segmento | **9** |
| CSS do customizer (post 5) | **41.011 bytes** |
| Itens de menu | **24** |
| Artigos do blog | **2** |

O container de teste foi destruído ao fim. **Produção não foi tocada em nenhum
momento.**

### Restore de verdade, se o pior acontecer

1. Suba WordPress e MariaDB limpos, com as mesmas variáveis do `docker-compose.yml` do backup.
2. Restaure o dump no banco novo.
3. `docker cp` do `uploads/` para `wp-content/`.
4. Reinstale os mu-plugins **a partir do git**, não do backup — o git é a fonte da verdade do código.
5. Confira: `python scripts/check_seo.py --wp` deve reportar 99 rotas no ar.

O passo 5 é o que fecha o ciclo: o validador cruza o WordPress contra o
keyword-map nos dois sentidos e acusa qualquer página que não tenha voltado.

## O que falta para P8 fechar

**Destino externo.** Hoje as cópias ficam em `/opt/backups/movecon`, **no mesmo
disco do site**. Isso protege contra erro humano, exclusão acidental e corrupção
de banco — **não protege contra perda do VPS**, que é o cenário que motivou a
pendência.

Precisa de credencial do cliente. Qualquer um destes serve:

- bucket S3 ou compatível (Backblaze B2, Wasabi) — chave de acesso
- rclone para Google Drive ou OneDrive — autorização OAuth
- outro servidor com SSH — chave pública

Feita a escolha, o envio é uma linha no fim do script e a pendência fecha.

**Segunda pendência, do lado do código:** o repositório remoto configurado é
**público**. 57 commits com o projeto inteiro nunca foram enviados — e não
devem ser, para lá. Ver P8b em `06-pendencias.md`.
