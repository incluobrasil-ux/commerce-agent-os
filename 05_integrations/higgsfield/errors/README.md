# higgsfield/errors/

Erros normalizados.

## Classes

| Classe | Quando |
|---|---|
| `HiggsfieldAuthError` | API key/registry token inválido (se aplicável) |
| `SkillNotFound` | skill id desconhecido no registry/local |
| `SkillManifestInvalid` | manifest malformado |
| `SkillExecutionError` | execução falhou (erro de runtime da skill) |
| `SkillBudgetExceeded` | budget_usd da execução excedido |
| `HiggsfieldCliMissing` | quando wrapper de CLI tenta invocar e binário não está instalado |

## Status

Stub.
