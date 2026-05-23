import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FakeClock, FakeIdGenerator, ValidationError } from '@cao/core';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { defineAgent, runAgent } from './index.js';

const echoAgent = defineAgent({
  name: 'test-echo',
  tier: 0,
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ echoed: z.string() }),
  prompt: (input) => `Echo: ${input.message}`,
});

function makeFakeComplete(textOut: string): CompleteFn {
  return async () => ({
    text: textOut,
    model: 'fake-model',
    usage: { inputTokens: 10, outputTokens: 20 },
    costUsd: 0.001,
    durationMs: 5,
  });
}

describe('runAgent', () => {
  let vaultRoot: string;
  let memory: Memory;

  beforeEach(async () => {
    vaultRoot = await fs.mkdtemp(join(tmpdir(), 'cao-runtime-test-'));
    memory = new Memory({ vaultRoot, tenantId: 'acme' });
    await memory.ensureBaseDir();
  });

  afterEach(async () => {
    await fs.rm(vaultRoot, { recursive: true, force: true });
  });

  it('happy path: valida input, chama LLM, valida output, registra audit', async () => {
    const obs = new SilentProvider();
    const clock = new FakeClock(1_700_000_000_000);
    const ids = new FakeIdGenerator('run');

    const result = await runAgent(
      echoAgent,
      { message: 'hello' },
      { tenantId: 'acme' },
      {
        complete: makeFakeComplete(JSON.stringify({ echoed: 'hello back' })),
        memory,
        observability: obs,
        clock,
        ids,
      },
    );

    expect(result.output).toEqual({ echoed: 'hello back' });
    expect(result.runId).toBe('run-1');
    expect(result.costUsd).toBeCloseTo(0.001);

    // Eventos disparados
    const events = obs.events.map((e) => e.event);
    expect(events).toContain('agent.invoked');
    expect(events).toContain('agent.completed');

    // Audit log gravado em memory
    const auditFiles = await memory.list('audit');
    expect(auditFiles.length).toBeGreaterThan(0);
    const auditContent = await memory.read(auditFiles[0]!);
    expect(auditContent).toContain('test-echo');
    expect(auditContent).toContain('ok');
    expect(auditContent).toContain('run-1');
  });

  it('falha quando input não bate schema', async () => {
    const obs = new SilentProvider();
    await expect(
      runAgent(
        echoAgent,
        { message: 123 }, // tipo errado
        { tenantId: 'acme' },
        {
          complete: makeFakeComplete('{"echoed":"x"}'),
          memory,
          observability: obs,
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError);

    // Evento de falha deve ser registrado
    const failed = obs.events.find((e) => e.event === 'agent.failed');
    expect(failed).toBeDefined();
  });

  it('falha quando output do LLM não bate schema', async () => {
    const obs = new SilentProvider();
    await expect(
      runAgent(
        echoAgent,
        { message: 'ok' },
        { tenantId: 'acme' },
        {
          complete: makeFakeComplete(JSON.stringify({ wrong_field: 'x' })),
          memory,
          observability: obs,
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('falha quando LLM retorna não-JSON e não há parseOutput custom', async () => {
    const obs = new SilentProvider();
    await expect(
      runAgent(
        echoAgent,
        { message: 'ok' },
        { tenantId: 'acme' },
        {
          complete: makeFakeComplete('not json at all'),
          memory,
          observability: obs,
        },
      ),
    ).rejects.toThrow(/not valid JSON/);
  });

  it('parseOutput custom é usado quando fornecido', async () => {
    const customAgent = defineAgent({
      name: 'test-custom-parse',
      tier: 0,
      inputSchema: z.object({}),
      outputSchema: z.object({ length: z.number() }),
      prompt: () => 'whatever',
      parseOutput: (text) => ({ length: text.length }),
    });

    const obs = new SilentProvider();
    const result = await runAgent(
      customAgent,
      {},
      { tenantId: 'acme' },
      {
        complete: makeFakeComplete('hello'),
        memory,
        observability: obs,
      },
    );

    expect(result.output.length).toBe(5);
  });
});
