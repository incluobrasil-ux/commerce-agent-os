---
created_at: 2026-05-27T00:30:00Z
updated_at: 2026-05-27T00:30:00Z
tags: [templates, legal, compliance]
source: human:incluobrasil
confidence: 1.0
---

# Legal profile — como configurar por loja

**Para que serve:** declarar para o Chefe (`pnpm chief`) os mercados onde uma store opera, idioma/moeda principal, políticas existentes e se ela autoriza writeback automático em conteúdo sensível. Sem isso, a camada jurídica devolve `blocked_missing_market_profile` antes de qualquer mudança.

**Como usar:**

1. Copie `legal-profile.example.json` para o vault da loja (não-versionado):
   ```
   cp 07_memory/vault/templates/legal-profile.example.json \
      07_memory/vault/tenants/<tenantId>/stores/<storeId>/legal-profile.json
   ```
2. Edite os campos: `jurisdictions`, `primaryLocale`, `primaryCurrency`, `existingPolicies`, `companyIdentity`.
3. `pnpm chief` carrega automaticamente — não precisa `--legal-profile=` se o arquivo estiver no path correto.

**Convenção de path** (alinhada com brain-bridge):
- Store-level: `07_memory/vault/tenants/<t>/stores/<s>/legal-profile.json`
- Tenant fallback: `07_memory/vault/tenants/<t>/legal-profile.json`

O Chefe tenta store primeiro, depois tenant. Se nenhum existir, mostra aviso e segue sem camada legal ativa (só warnings, sem bloqueio).

## Campos

| Campo | Tipo | Obrigatório | Comentário |
|---|---|---|---|
| `tenantId` | string | ✅ | bate com `--tenant` |
| `storeId` | string | ✅ | bate com `--store` |
| `jurisdictions` | `('BR'\|'EU'\|'US-CA'\|'US-FED')[]` | ✅ | mercados onde a loja opera de fato (não onde gostaria) |
| `primaryLocale` | string | ✅ | ISO-639-1, ex.: `pt-BR`, `en-US`, `de-DE` |
| `primaryCurrency` | string | ✅ | ISO-4217 |
| `maturityLevel` | `'starter'\|'intermediate'\|'mature'` | ✅ | conservador no starter |
| `existingPolicies` | `Array<{type, url}>` | ✅ | tipos: `privacy`, `terms`, `refund`, `returns`, `shipping`, `contact`, `about`, `cookies` |
| `consentRegime` | `'opt-in-strict'\|'opt-out'\|'gpc-aware'\|'none'` | opcional | obrigatório quando EU/US-CA em jurisdictions |
| `allowsSensitiveWriteback` | boolean | ✅ | se `false`, claims/privacy/cookies/subscription/reviews caem para dry-run mesmo com `--execute` |
| `companyIdentity` | objeto | opcional | obrigatório para BR (CDC Art. 31) |

## Avaliação por mercado

| Jurisdição | Regras hard | Regras soft |
|---|---|---|
| **BR** | LGPD privacy page · CDC company identity · CDC returns 7-day · CONAR claims médicos | — |
| **EU** | GDPR privacy · GDPR cookies opt-in · CRD withdrawal 14-day | Omnibus price disclosure |
| **US-FED** | FTC claims substantiation | FTC endorsement disclosure |
| **US-CA** | CCPA notice at collection · CCPA opt-out link | — |

Detalhe em [06_packages/orchestration/src/legal.ts](../../../../06_packages/orchestration/src/legal.ts).

## Limites

Esta camada **não substitui** parecer jurídico. Ela:
- evita writeback cego sem políticas mínimas;
- sinaliza risco por jurisdição com `ruleId` rastreável;
- bloqueia operações sensíveis sem aprovação humana.

Para mudanças jurídicas reais (claims, política de privacidade, devolução), **consulte advogado**.
