# Global brain

Camada **global** do cérebro operacional. Aqui vivem:

- visão consolidada cross-tenant
- padrões / pattern library
- decisões arquiteturais (índice; ADRs canônicos em `02_architecture/`)
- run-summaries de marcos que afetam todos os tenants

**Regras:**

1. Conteúdo aqui é **cross-tenant** ou **arquitetural**. Nada específico de uma loja.
2. Aprendizado de tenant/store só sobe pra cá via **curadoria explícita** (não auto-promote).
3. Versionado no repo (acessível ao time). Tenant/store é local.
4. Dev brain (history canônico do projeto) continua em `07_memory/vault/projects/commerce-agent-os/`. **Este global/** é o que o time toca no dia a dia.

**Arquivos:**

- [current-state.md](current-state.md) — estado real consolidado (1 página).
- [decision-index.md](decision-index.md) — índice de ADRs + decisões cross-tenant.
- [workstreams.md](workstreams.md) — trilhas paralelas que envolvem múltiplos tenants ou afetam infra.
- [run-summaries/index.md](run-summaries/index.md) — milestones cross-tenant.
