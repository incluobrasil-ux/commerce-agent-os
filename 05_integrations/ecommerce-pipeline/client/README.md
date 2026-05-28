# client/

`resolvePipeline()`, `assertProjectExists()`, `runStep()` — invocam o Python externo via `child_process.spawn`. Streaming de stdout/stderr, timeout configurável, exit code retornado em `RunResult` (sem lançar). Lança apenas em falha estrutural (pipeline root ausente, projeto não existe, Python não encontrado, timeout).
