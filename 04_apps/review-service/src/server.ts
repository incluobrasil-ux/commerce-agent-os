// src/server.ts — placeholder.
//
// Quando implementado (Fase 11):
// - HTTP fino:
//   POST /webhooks/judge-me     → handler (HMAC verify) → enqueue reviews.ingested
//   POST /webhooks/yotpo
//   POST /webhooks/loox
//   POST /webhooks/stamped
//   POST /webhooks/okendo
//   GET  /health
// - Init de @cao/observability.
// - Init de worker pool.
// - Registro de cron: poll-reviews (15min), aggregate-rating-sync (diário), synthesize-voc (semanal).

export {};
