// @cao/shared-config — placeholder
// Schemas e nomes canônicos de configuração compartilhados.
// Apenas declarações (schemas + constantes); a carga real de env vars
// vive em @cao/config (que consome este package).
//
// Itens planejados:
// - EnvSchema (validação de process.env)
// - SecretNames (constantes para nomes de env vars; evita typos)
// - FeatureFlagSchema
// - PolicyRefSchema

export const SECRET_NAMES = {
  SHOPIFY_API_KEY: 'SHOPIFY_API_KEY',
  SHOPIFY_API_SECRET: 'SHOPIFY_API_SECRET',
  SHOPIFY_SCOPES: 'SHOPIFY_SCOPES',
  GOOGLE_OAUTH_CLIENT_ID: 'GOOGLE_OAUTH_CLIENT_ID',
  GOOGLE_OAUTH_CLIENT_SECRET: 'GOOGLE_OAUTH_CLIENT_SECRET',
  GOOGLE_MERCHANT_ACCOUNT_ID: 'GOOGLE_MERCHANT_ACCOUNT_ID',
  BRIGHTDATA_API_KEY: 'BRIGHTDATA_API_KEY',
  POSTHOG_API_KEY: 'POSTHOG_API_KEY',
  POSTHOG_HOST: 'POSTHOG_HOST',
  HIGGSFIELD_API_KEY: 'HIGGSFIELD_API_KEY',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  GEMINI_API_KEY: 'GEMINI_API_KEY',
} as const;

export type SecretName = (typeof SECRET_NAMES)[keyof typeof SECRET_NAMES];
