# src/providers/

Adapters para provedores externos de mídia (image + video). Cada provider implementa a interface `MediaProvider`.

## Interface esperada

```ts
interface MediaProvider {
  readonly name: string;
  readonly capabilities: { image: boolean; video: boolean; maxResolution: string };
  generate(opts: GenerateOpts): Promise<GeneratedAsset>;
  estimateCost(opts: GenerateOpts): Promise<number>;
}
```

## Por que adapter aqui (e não em `05_integrations/`)

- Provedores de mídia (image/video) são detalhe **deste serviço**, não do projeto inteiro.
- Outros serviços não chamam image-gen direto — quem precisa, chama `creative-copy-assets` → este serviço.
- Mover para `05_integrations/media-providers/` é opção se mais consumidores aparecerem (ADR futuro).

## Providers planejados

A definir. ADR pendente.

## Status

Stub. Lista zerada — decisão pendente.
