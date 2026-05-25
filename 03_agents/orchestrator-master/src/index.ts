// orchestrator-master — Tier 0. Roteador conservador entre agentes existentes.
//
// Lê um objetivo e a lista de agentes disponíveis no momento e propõe uma rota
// mínima (sequência) de invocações. Modo `plan` apenas — execução real fica
// para iterações futuras (depende de orquestrador stateful, fora deste escopo).
//
// Design inspirado em LangGraph (01_upstreams/langgraph): state machine + edges
// determinísticas. Aqui simplificado para UMA chamada LLM que produz a rota
// como JSON estruturado validado por zod. Sem máquina de estado real ainda —
// suficiente para uso operacional inicial. Adaptado, não copiado.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

/** Lista canônica de agentes operacionais (atualizar ao adicionar novo). */
export const KNOWN_AGENTS = [
  'repo-auditor',
  'audit-synthesizer',
  'learning-memory-curation',
  'memory-context',
  'product-feed-seo',
  'catalog-feed-ops',
] as const;
export type KnownAgent = (typeof KNOWN_AGENTS)[number];

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  objective: z.string().min(5).max(500),
  contextBrief: z.string(),
  availableAgents: z.array(z.string().min(2)).min(1).max(20),
  constraints: z.array(z.string()),
  maxSteps: z.number().int().min(1).max(20),
  mode: z.enum(['plan', 'dispatch']),
});
export type OrchestratorInput = z.infer<typeof inputSchema>;

const routeStepSchema = z.object({
  agent: z.string().min(2),
  purpose: z.string().min(5).max(200),
  reason: z.string().min(5).max(300),
});
export type RouteStep = z.infer<typeof routeStepSchema>;

export const outputSchema = z.object({
  route: z.array(routeStepSchema).min(1).max(20),
  aggregatedSummary: z.string().min(10).max(1000),
  artifacts: z.array(z.string()),
  risks: z.array(z.string()),
  nextActions: z.array(z.string()),
});
export type OrchestratorOutput = z.infer<typeof outputSchema>;

export const orchestratorMasterAgent = defineAgent<OrchestratorInput, OrchestratorOutput>({
  name: 'orchestrator-master',
  tier: 0,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a conservative router of operational agents. Given an objective, a context brief, ' +
    'and a list of available agents, you produce the SHORTEST sequence of agent calls that ' +
    'addresses the objective. You never invent agents that are not in the available list. You ' +
    'prefer fewer steps. You explicitly list risks and known gaps. You always respond with valid ' +
    'JSON matching the requested schema. No prose outside the JSON object.',
  prompt: (input) =>
    [
      `Tenant: ${input.tenantId}`,
      `Objective: ${input.objective}`,
      `Mode: ${input.mode} (plan = describe route only; dispatch = same JSON, execution is external)`,
      `Max steps: ${input.maxSteps}`,
      '',
      '## Available agents (only use these)',
      ...input.availableAgents.map((a) => `- ${a}`),
      '',
      '## Constraints',
      ...(input.constraints.length > 0 ? input.constraints.map((c) => `- ${c}`) : ['(nenhuma)']),
      '',
      '## Context brief',
      '```',
      input.contextBrief || '(sem brief — operador não forneceu)',
      '```',
      '',
      'Produce JSON with these fields:',
      '- route: array (1–maxSteps) of { agent, purpose, reason }.',
      '  agent MUST be in availableAgents.',
      '  purpose: what this step delivers.',
      '  reason: why this step is needed for the objective.',
      '- aggregatedSummary: 1 paragraph (10–1000 chars) summarizing the route end-to-end.',
      '- artifacts: array of file paths or output identifiers this route will produce.',
      '- risks: array of short strings — what could go wrong; empty if route is trivial.',
      '- nextActions: array of strings — concrete follow-ups for human operator after the route runs.',
      '',
      'Rules:',
      '- Prefer FEWER steps. Never propose more than necessary.',
      '- Never use an agent not in availableAgents.',
      '- If the objective cannot be addressed by the available agents, return a 1-step route ' +
        'with a synthesizer/auditor and explain the gap in risks + nextActions.',
      '',
      'Respond with the JSON object only. No code fences, no commentary.',
    ].join('\n'),
  parseOutput: (text) => {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '');
    return JSON.parse(cleaned);
  },
});
