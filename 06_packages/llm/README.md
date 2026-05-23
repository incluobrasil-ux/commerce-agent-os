# @cao/llm

Abstração sobre provedores de LLM (Anthropic, OpenAI, Gemini) e modelos de mídia.

## API prevista
- `chat({ model, messages, schema?, tools?, stream? })` — interface unificada.
- `embed({ model, input })`.
- `imageGenerate({ model, prompt, size })`, `videoGenerate(...)`.
- `tokenCount({ model, text })`.
- Token accounting + cost tracking automático.

## Provedores
- Anthropic (default para texto).
- OpenAI / Gemini (alternativos + multimodal).
- Provedores de imagem/vídeo a definir (encapsulados, expostos via `imageGenerate/videoGenerate`).

## Consumido por
- Quase todos os agentes via `@cao/runtime`.

## Não fazer aqui
- Lógica de domínio.
- Streaming de UI — apenas streaming de tokens; UI lida com o resto.

## Status
Stub.
