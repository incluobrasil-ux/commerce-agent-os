---
tipo: runbook
workstream: site
status: em-andamento
tags: [dns, infra, deploy, movecon]
atualizado: 2026-07-25
---

# 🔧 Runbook — DNS e Infraestrutura

> Passo a passo operacional para colocar `moveconconsorcio.com` no ar.
> Relacionado: [[Plano de Implementacao (base Crelider)]] · [[Dados Cadastrais]]

## Onde fica cada coisa

| Item | Onde | Observação |
|---|---|---|
| **Registro do domínio** | **Squarespace** (ex-Google Domains) | Painel de DNS é lá |
| **E-mail** | Google Workspace | Já configurado ✅ |
| **Site** | VPS Hostinger — **`2.24.220.21`** | Mesmo VPS da Crelider e do CRM (decidido 25/07/2026) |
| **SSL / proxy** | Container `crm_caddy` | Config em `/opt/crm/infra/Caddyfile` |
| **WordPress** | Containers `movecon_wp` + `movecon_db` | A criar em `/opt/movecon/` |

> IP confirmado em 25/07/2026 por resolução DNS: `crelider.com`, `www.crelider.com` e `api.crmcrelider.com` → `2.24.220.21`.

---

## Estado do DNS

### ✅ Já configurado (e-mail — não mexer)
| Tipo | Nome | Dados |
|---|---|---|
| MX | `@` | `smtp.google.com` (prio 1) |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` |
| TXT | `google._domainkey` | chave DKIM |

### 🔲 A adicionar
| Tipo | Nome | TTL | Dados |
|---|---|---|---|
| A | `@` | 1h | `2.24.220.21` |
| A | `www` | 1h | `2.24.220.21` |
| TXT | `_dmarc` | 1h | `v=DMARC1; p=none; rua=mailto:contato@moveconconsorcio.com` |

### 🗑️ A remover — bloco "Padrões do Squarespace"
Apagar o bloco inteiro pela lixeira: os 4 registros A (`198.49.23.144`, `198.185.159.145`, `198.185.159.144`, `198.49.23.145`), o CNAME `www` → `ext-sq.squarespace.com` e o registro **HTTPS**.

> ⚠️ **O registro HTTPS é a armadilha.** Ele carrega `ipv4hint="198.185.159.144,..."` embutido. Se sobrar, navegadores que leem HTTPS/SVCB continuam indo para a Squarespace mesmo com o A correto — sintoma típico de "não atualizou no meu navegador". **Apagar junto, sem exceção.**

O CNAME `_domainconnect` pode ficar — é inofensivo.

---

## ✅ EXECUTADO EM 25/07/2026 — site no ar

`https://moveconconsorcio.com` está de pé, com HTTPS válido (Let's Encrypt, expira 23/10/2026).

| Item | Estado |
|---|---|
| Containers `movecon_wp` + `movecon_db` | ✅ rodando, em `/opt/movecon/` |
| Bloco no `/opt/crm/infra/Caddyfile` | ✅ (backup: `Caddyfile.bak-20260725-214352`) |
| HTTPS + redirect http→https (308) | ✅ |
| WordPress 7.0 + tema **Astra** | ✅ |
| Permalink `/%postname%/` · fuso America/Bahia | ✅ |
| 11 plugins ativos | ✅ |
| Design tokens no Customizer (13.824 bytes) | ✅ |
| mu-plugin `movecon-fonts.php` (Montserrat + Inter) | ✅ |
| Temas e plugins padrão removidos | ✅ |
| **Indexação LIGADA** (`blog_public=1`) | 🌐 público desde 25/07/2026 |
| Conteúdo de exemplo do WP removido | ✅ Hello world, Sample Page, Privacy Policy |
| **Logo** no header (Astra `custom_logo`) | ✅ assinatura vertical |
| **Favicon** (`site_icon`) | ✅ **só o símbolo**, 512×512 — conforme manual §05 |
| **Páginas publicadas** | ✅ `/` (Home, ID 12) · `/administrado-pela-alpha/` (ID 9) · `/contato/` (ID 14) |
| **Header e rodapé da marca** | ✅ mu-plugin `movecon-header-footer.php` — substitui os do Astra |

### Código versionado em `05 - Site/_codigo/`
| Arquivo | Onde vive no servidor |
|---|---|
| `movecon-header-footer.php` | `wp-content/mu-plugins/` — header + rodapé da marca |
| `movecon-fonts.php` | `wp-content/mu-plugins/` — Montserrat + Inter |
| `pagina-home.html` · `pagina-contato.html` · `pagina-alpha-limpa.html` | conteúdo das páginas (bloco `wp:html`) |
| `tokens-movecon.css` | Customizer → CSS adicional |

> **Ao editar:** alterar o arquivo aqui, subir via `scp` para `/tmp/` e aplicar com
> `docker cp` (mu-plugins) ou `wpcli-movecon.sh post update <ID> /host/<arquivo>` (páginas).
| CSS unificado no Customizer | ✅ 22 KB — tokens + componentes `.mv-page`, sem `<style>` por página |

> **Arquitetura de CSS:** o CSS de componentes vive **no Customizer**, não dentro de cada página.
> Páginas novas carregam só o HTML dentro de `<div class="mv-page">`. Não repetir `<style>` por página.

> **Regra herdada da Crelider, já aplicada:** toda página com hero recebe
> `wp post meta update <ID> site-post-title disabled` para não duplicar o H1.

**Acesso:** credenciais em `/opt/movecon/wp-admin-credentials.txt` (chmod 600).
**Wrapper WP-CLI:** `bash /root/wpcli-movecon.sh <comando wp>`
**SSH:** `ssh -i ~/.ssh/id_ed25519 root@2.24.220.21` (a chave `hostinger_crm` **não** funciona).

> ⚠️ **Prioridade agora que o site é indexável:** publicar conteúdo real o quanto antes.
> O Google já pode rastrear — quanto menos tempo o domínio ficar praticamente vazio, melhor a primeira impressão de qualidade.
> Ordem sugerida: `/administrado-pela-alpha` (copy pronta) → Home → `/contato`.

Crelider e CRM verificados após as mudanças — ambos respondendo HTTP 200, sem impacto.

---

## Ordem de execução (referência)

1. **DNS primeiro.** O Caddy só emite o certificado SSL depois que o domínio resolve para o VPS. Sem isso, o Let's Encrypt não valida.
2. Criar `/opt/movecon/` com `docker-compose.yml` (WordPress + MariaDB), rede compatível com o `crm_caddy`.
3. Adicionar o bloco de `moveconconsorcio.com` no `/opt/crm/infra/Caddyfile` e recarregar.
4. Verificar se o Caddy tem destino padrão — evitar que `moveconconsorcio.com` caia no site da Crelider durante a janela de transição.
5. Instalar tema Astra + os 15 plugins. Permalink `/%postname%/`.
6. UpdraftPlus → Google Drive **antes** de qualquer conteúdo.
7. LiteSpeed **desligado** durante a construção.
8. Wrapper `/root/wpcli-movecon.sh` (espelho do `/root/wpcli.sh` da Crelider).

---

## Pendências

- [ ] **Confirmar acesso ao VPS** (hPanel → VPS → Manage → Browser Terminal)
- [ ] Criar `contato@moveconconsorcio.com` no Workspace
- [ ] Telefone comercial e horário de atendimento para o rodapé
- [ ] 🚨 **Bloquear `POST /api/auth/register` no Caddy** — rota do CRM aberta na internet. Risco herdado do ambiente; resolver antes de qualquer coisa nova entrar no ar.

---

## Ajustes futuros

**SPF com Brevo.** Quando o formulário (Fluent Forms) passar a enviar por Brevo, editar o TXT existente para:
```
v=spf1 include:_spf.google.com include:spf.brevo.com ~all
```
⚠️ **Um único registro SPF.** Dois registros invalidam um ao outro e derrubam a entrega de e-mail.

**DMARC.** Após ~4 semanas monitorando com `p=none`, endurecer para `p=quarantine`.

**TTL.** Se for necessário migrar de servidor no futuro, baixar o TTL para 300s dois dias antes.
