# Migração de VPS + domínio suspenso — 12/08/2026

> Estado: **site no ar novamente** ✅ · backup salvo fora do VPS ✅ · VPS novo aguardando acesso 🔲
> Relacionado: [[Runbook - DNS e Infra]] · [[backup-restore]]

## ✅ RESOLVIDO em 12/08/2026 — era verificação de e-mail da ICANN

O `clientHold` foi removido às **20:23 UTC de 12/08/2026**, depois que o titular
concluiu a confirmação de e-mail pendente na Squarespace. Confirmação:

| Teste | Resultado |
|---|---|
| Status RDAP | só `client delete prohibited` + `client transfer prohibited` (normais) |
| `moveconconsorcio.com` | resolve para `2.24.220.21`, DNSSEC validando (`AD:true`) |
| `https://moveconconsorcio.com/` | **HTTP 200** |
| `www` → apex · `http` → `https` | 301 · 308 |
| Certificado | Let's Encrypt `CN=moveconconsorcio.com`, válido até 23/10/2026 |
| MX | `smtp.google.com` — e-mail restabelecido |
| Sitemap `/sitemap-movecon.xml` | 200, **94 URLs** |

**Lição:** registro de domínio novo tem prazo de 15 dias para o titular confirmar
o e-mail. Perdido o prazo, o registrador é *obrigado* pela ICANN a suspender —
e o sintoma (site fora do ar, DNS "sumido") é idêntico ao de um servidor caído.
**Checar o status RDAP antes de suspeitar da infra.**

---

## O diagnóstico original (registrado para referência)

### 🚨 O domínio estava suspenso — não era propagação, não era o VPS

`moveconconsorcio.com` dá **NXDOMAIN** em todos os resolvers. A causa está no
registrador, não na infra. RDAP da Verisign, consultado em 12/08/2026:

```
status:       ["client delete prohibited", "client hold", "client transfer prohibited"]
registration: 2026-07-25
expiration:   2027-07-25      ← não expirou
last changed: 2026-08-09      ← data provável do hold
registrar:    Squarespace Domains II LLC
nameservers:  NSB1..NSB4.SQUARESPACEDNS.COM
```

**`clientHold`** faz o registro `.com` remover o domínio da zona. Sem delegação,
não existe registro para propagar — apontar para qualquer IP é indiferente.
Derruba **site e e-mail** (o Workspace de `@moveconconsorcio.com` cai junto).

**Causa mais provável:** verificação de e-mail do titular exigida pela ICANN.
O registrador deve suspender o domínio se o titular não confirmar em 15 dias.
Registro 25/07 + 15 dias = **09/08**, que bate com o `last changed`.
Hipótese secundária: cobrança recusada.

**Resolução — só pelo painel da Squarespace:** reenviar a verificação e clicar no
link; conferir Billing.
⚠️ Se o e-mail do titular for `@moveconconsorcio.com`, ele **não chega** — o hold
derrubou o MX. Trocar o contato do titular para um endereço externo antes.

## O VPS antigo nunca caiu

Verificado em 12/08/2026:

| Item | Estado |
|---|---|
| `crelider.com` | HTTP 200 em `2.24.220.21` |
| Site MOVECON, com Host forçado no IP | HTTP **200** — servindo normalmente |
| `movecon_wp` · `movecon_db` · `crm_caddy` | Up 2–4 weeks |
| SSH `root@2.24.220.21` com `~/.ssh/id_ed25519` | ✅ funciona |

## ✅ P8 fechada na prática — backup fora do VPS

O backup diário rodava, mas só no disco do próprio servidor
(`AVISO: /etc/movecon-backup.env nao existe` em todo log). Cópia trazida para fora:

```
C:\tmp\movecon-backup-vps\
  movecon-2026-08-12.tar.gz   821K   sha256 44d2e5fc…8cb3a71  (idêntico ao do servidor)
  movecon-2026-W32.tar.gz     821K
  extraido/                   conteúdo conferido
```

Conteúdo: `banco.sql` (4,4 MB · 64 tabelas · 5.058 linhas) + `configs/`
(`wp-config.php`, `docker-compose.yml`, `wpcli-movecon.sh`, `Caddyfile`) + `uploads/`.

> Isto é uma cópia pontual, não substitui o destino externo automatizado.
> A P8 só fecha de vez com `/etc/movecon-backup.env` no lugar.

## Baseline de produção — alvo de validação do restore

Medido em 12/08/2026 via `wpcli-movecon.sh`:

| Métrica | Valor |
|---|---|
| Páginas publicadas | **115** |
| Artigos (`post`) publicados | 0 |
| Itens de menu | **24** |
| CSS do Customizer (post 5) | **42.278 bytes** |
| Plugins ativos | **10** |
| WordPress | **7.0.3** |

Depois do restore, estes números precisam bater. Fechamento do ciclo:
`python scripts/check_seo.py --wp`.

## VPS novo — Hostinger KVM 2

| Item | Valor |
|---|---|
| IPv4 | `179.198.125.244` |
| Host | `srv1899791.hstgr.cloud` |
| SO | Ubuntu 24.04 LTS |
| Local | Brasil — Campinas |
| Recursos | 2 vCPU · 8 GB RAM · 100 GB · 8 TB |
| Validade | 2026-09-12 · renovação automática **desligada** ⚠️ |

**Bloqueio atual:** SSH responde na 22, mas `Permission denied (publickey,password)`.
Falta instalar a chave pública desta máquina no painel (VPS → Chave SSH → Gerenciar):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAII0Bwb15lqWE2imdwLszzO9QWcTkREzwD8UKhONKmfV+ samue@vps-hostinger
```

## Achados na zona DNS (print de 12/08/2026)

O bloco "Padrões do Squarespace" já foi removido — sobrou só o CNAME
`_domainconnect`, inofensivo, como previsto no runbook. Dois ajustes pendentes:

- ✅ **DMARC corrigido em 12/08/2026.** Estava com `rua=mailto:contato@movecon.com.br`
  — domínio que **não pertence à MOVECON** — e os relatórios de autenticação iam
  para terceiros ou para o vazio. Valor atual, conferido no DNS público:
  `v=DMARC1; p=none; rua=mailto:contato@moveconconsorcio.com`.
  Pilha de e-mail completa e validada: SPF (registro **único**) · DKIM (`google._domainkey`) · DMARC · MX.
  > Em ~4 semanas de `p=none`, endurecer para `p=quarantine` (ver [[Runbook - DNS e Infra]]).
- ⏱️ **TTL do A `@` está em 4 horas.** Baixar para 300s dois dias antes da virada
  de VPS. O `www` já está em 1 hora.

## Ordem de execução

1. ✅ **Cliente:** `clientHold` removido na Squarespace — site de volta ao ar.
2. 🔲 **Cliente:** liberar a chave SSH no VPS novo.
3. 🔲 Provisionar o VPS novo: Docker, Caddy, `movecon_wp` + `movecon_db`.
4. 🔲 Restaurar `banco.sql` + `uploads/`; mu-plugins **a partir do git**, não do backup.
5. 🔲 Validar contra o baseline acima, com `/etc/hosts` local apontando para o IP novo
   (o Caddy não emite certificado enquanto o domínio não resolver).
6. 🔲 Configurar `/etc/movecon-backup.env` no VPS novo — fechar a P8 de verdade.
7. 🔲 Só então virar o DNS na Squarespace para `179.198.125.244`.
8. 🔲 Ligar a renovação automática do VPS novo.

> **TTL:** baixar para 300s antes da virada. Como o domínio está em hold, a zona
> vai ser republicada do zero quando o hold sair — momento conveniente para já
> subir com o IP novo e evitar duas viradas.
