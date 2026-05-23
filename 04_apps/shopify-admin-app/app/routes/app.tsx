// app/routes/app.tsx — placeholder.
// Layout dentro do admin Shopify (autenticado).
//
// Estrutura mínima esperada:
// - loader: shopify.authenticate.admin(request) → session
// - default: <AppProvider>...<Outlet /></AppProvider> com NavMenu Polaris
// - links/headers boundary para iframe embedded
//
// Sub-rotas (futuras):
//   app._index.tsx          dashboard
//   app.feed.tsx            painel do feed (invoca product-feed-seo / catalog-feed-ops)
//   app.reviews.tsx         VoC (invoca reviews-ops)
//   app.compliance.tsx      merchant-compliance findings
//   app.settings.tsx        config do tenant

export {};
