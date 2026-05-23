// higgsfield/errors/index.ts — erros normalizados.

export class HiggsfieldAuthError extends Error {
  readonly code = 'HIGGSFIELD_AUTH' as const;
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'HiggsfieldAuthError';
  }
}

export class SkillNotFound extends Error {
  readonly code = 'HIGGSFIELD_SKILL_NOT_FOUND' as const;
  constructor(public readonly skillId: string) {
    super(`Skill not found: ${skillId}`);
    this.name = 'SkillNotFound';
  }
}

export class SkillManifestInvalid extends Error {
  readonly code = 'HIGGSFIELD_MANIFEST_INVALID' as const;
  constructor(public readonly skillId: string, message: string) {
    super(`Skill ${skillId} manifest invalid: ${message}`);
    this.name = 'SkillManifestInvalid';
  }
}

export class SkillExecutionError extends Error {
  readonly code = 'HIGGSFIELD_EXECUTION' as const;
  constructor(
    public readonly skillId: string,
    message: string,
    cause?: unknown,
  ) {
    super(`Skill ${skillId} execution failed: ${message}`, { cause });
    this.name = 'SkillExecutionError';
  }
}

export class SkillBudgetExceeded extends Error {
  readonly code = 'HIGGSFIELD_BUDGET' as const;
  constructor(
    public readonly skillId: string,
    public readonly budgetUsd: number,
    public readonly actualUsd: number,
  ) {
    super(`Skill ${skillId} exceeded budget USD ${budgetUsd} (actual: ${actualUsd})`);
    this.name = 'SkillBudgetExceeded';
  }
}

export class HiggsfieldCliMissing extends Error {
  readonly code = 'HIGGSFIELD_CLI_MISSING' as const;
  constructor() {
    super('Higgsfield CLI binary not found on PATH; install with `npm i -g @higgsfield/cli` (confirmar pacote)');
    this.name = 'HiggsfieldCliMissing';
  }
}
