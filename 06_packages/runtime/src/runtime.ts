// Runtime mínimo de agente.
// Fluxo: validate(input) → prompt(input, ctx) → llm.complete → parseOutput → validate(output) → audit.

import { BaseError, type Clock, type IdGenerator, SystemClock, UuidGenerator } from '@cao/core';
import { validate } from '@cao/guardrails';
import type { CompleteFn } from '@cao/llm';
import type { Memory } from '@cao/memory';
import type { ObservabilityProvider } from '@cao/observability';
import type { ZodType } from 'zod';

export class AgentRunError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'AGENT_RUN', context, cause);
  }
}

export interface AgentContext {
  tenantId: string;
  runId: string;
  agentName: string;
  clock: Clock;
  memory: Memory;
  observability: ObservabilityProvider;
}

export interface AgentDefinition<I, O> {
  /** Identificador do agente (ex.: `repo-auditor`). */
  name: string;
  /** Tier conforme ADR-0003. */
  tier: number;
  /** Schema de input. */
  inputSchema: ZodType<I>;
  /** Schema de output. */
  outputSchema: ZodType<O>;
  /** Gera o prompt enviado ao LLM. */
  prompt: (input: I, ctx: AgentContext) => string | Promise<string>;
  /** Parser opcional do texto do LLM em estrutura. Default: JSON.parse. */
  parseOutput?: (text: string, input: I, ctx: AgentContext) => unknown | Promise<unknown>;
  /** Modelo default do agente (sobrescreve default do client). */
  model?: string;
  /** Instrução de sistema (opcional). */
  system?: string;
}

export interface RunDeps {
  complete: CompleteFn;
  memory: Memory;
  observability: ObservabilityProvider;
  clock?: Clock;
  ids?: IdGenerator;
}

export interface RunOptions {
  tenantId: string;
}

export interface RunResult<O> {
  output: O;
  runId: string;
  durationMs: number;
  costUsd: number;
  model: string;
}

export function defineAgent<I, O>(def: AgentDefinition<I, O>): AgentDefinition<I, O> {
  return def;
}

export async function runAgent<I, O>(
  agent: AgentDefinition<I, O>,
  input: unknown,
  opts: RunOptions,
  deps: RunDeps,
): Promise<RunResult<O>> {
  const clock = deps.clock ?? new SystemClock();
  const ids = deps.ids ?? new UuidGenerator();
  const runId = ids.next();
  const startMs = clock.nowMs();

  const baseEvent = {
    agent_name: agent.name,
    tier: agent.tier,
    run_id: runId,
    tenant_id: opts.tenantId,
  };

  deps.observability.capture('agent.invoked', baseEvent);

  try {
    const validatedInput = validate(agent.inputSchema, input, `${agent.name}.input`);

    const ctx: AgentContext = {
      tenantId: opts.tenantId,
      runId,
      agentName: agent.name,
      clock,
      memory: deps.memory,
      observability: deps.observability,
    };

    const promptText = await agent.prompt(validatedInput, ctx);

    const llmResult = await deps.complete({
      user: promptText,
      ...(agent.system !== undefined && { system: agent.system }),
      ...(agent.model !== undefined && { model: agent.model }),
    });

    const rawParsed = agent.parseOutput
      ? await agent.parseOutput(llmResult.text, validatedInput, ctx)
      : safeJsonParse(llmResult.text);

    const validatedOutput = validate(agent.outputSchema, rawParsed, `${agent.name}.output`);

    const durationMs = clock.nowMs() - startMs;

    // Audit log em markdown — append em audit/<YYYY-MM-DD>.md do tenant.
    await writeAuditEntry(deps.memory, {
      runId,
      agentName: agent.name,
      tier: agent.tier,
      tenantId: opts.tenantId,
      durationMs,
      costUsd: llmResult.costUsd,
      model: llmResult.model,
      tokensIn: llmResult.usage.inputTokens,
      tokensOut: llmResult.usage.outputTokens,
      outcome: 'ok',
      timestamp: clock.now(),
    });

    deps.observability.capture('agent.completed', {
      ...baseEvent,
      ms: durationMs,
      tokens: llmResult.usage.inputTokens + llmResult.usage.outputTokens,
      cost_usd: llmResult.costUsd,
      outcome: 'ok',
    });

    return {
      output: validatedOutput,
      runId,
      durationMs,
      costUsd: llmResult.costUsd,
      model: llmResult.model,
    };
  } catch (err) {
    const durationMs = clock.nowMs() - startMs;
    deps.observability.capture('agent.failed', {
      ...baseEvent,
      ms: durationMs,
      error_code: err instanceof BaseError ? err.code : 'UNKNOWN',
      error_message: err instanceof Error ? err.message : String(err),
    });
    // Audit também em falha.
    await writeAuditEntry(deps.memory, {
      runId,
      agentName: agent.name,
      tier: agent.tier,
      tenantId: opts.tenantId,
      durationMs,
      costUsd: 0,
      model: agent.model ?? 'unknown',
      tokensIn: 0,
      tokensOut: 0,
      outcome: 'error',
      errorMessage: err instanceof Error ? err.message : String(err),
      timestamp: clock.now(),
    }).catch(() => {
      // audit log não deve esconder o erro original
    });
    throw err;
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new AgentRunError('LLM output is not valid JSON', { text: text.slice(0, 200) }, err);
  }
}

interface AuditEntry {
  runId: string;
  agentName: string;
  tier: number;
  tenantId: string;
  durationMs: number;
  costUsd: number;
  model: string;
  tokensIn: number;
  tokensOut: number;
  outcome: 'ok' | 'error';
  errorMessage?: string;
  timestamp: Date;
}

async function writeAuditEntry(memory: Memory, entry: AuditEntry): Promise<void> {
  const datePart = entry.timestamp.toISOString().slice(0, 10);
  const path = `audit/${datePart}.md`;
  const line = formatAuditLine(entry);
  await memory.append(path, line);
}

function formatAuditLine(entry: AuditEntry): string {
  const ts = entry.timestamp.toISOString();
  const base = `- ${ts} | ${entry.agentName} (tier ${entry.tier}) | run=${entry.runId} | ${entry.outcome} | ${entry.durationMs}ms | tokens=${entry.tokensIn}+${entry.tokensOut} | $${entry.costUsd.toFixed(6)} | model=${entry.model}`;
  return entry.outcome === 'error' && entry.errorMessage
    ? `${base} | error="${entry.errorMessage.replace(/"/g, "'")}"\n`
    : `${base}\n`;
}
