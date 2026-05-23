// src/server.ts — placeholder.
//
// Quando implementado (Fase 9):
// - HTTP server fino (fastify candidato) com rotas:
//   POST /webhooks/shopify/products       → enqueue produto-mutated worker
//   POST /webhooks/shopify/orders         → enqueue order-event worker
//   POST /webhooks/shopify/app-uninstalled → tenant cleanup
//   GET  /health                          → liveness/readiness
// - Init de @cao/observability (PostHog server-side).
// - Init de worker queue (BullMQ + Redis ou alternativa).
// - Registro de cron jobs (drift-sync, compliance-sweep, etc.).
//
// HTTP responde 200 imediatamente após validar/enqueue; processamento é async no worker.

export {};
