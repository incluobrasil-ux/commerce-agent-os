// Public surface do @cao/orchestration.
//
// Esta camada conecta:
//   - registry (capability map de agentes)
//   - legal (matrix regulatória BR/EU/US)
//   - bundle (ContextBundle estendido)
//   - policy (decisão/guardrails)
//   - playbooks (rotas pré-definidas)
//   - planner (intent → plano)
//   - runner (state machine + checkpoints)
//   - writeback-gate (porta de segurança antes de aplicar)

export * from './registry.js';
export * from './legal.js';
export * from './bundle.js';
export * from './policy.js';
export * from './playbooks.js';
export * from './planner.js';
export * from './runner.js';
export * from './writeback-gate.js';
export * from './dispatcher.js';
export * from './legal-loader.js';
