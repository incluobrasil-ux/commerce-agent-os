// Tipos do captureRun — schema do que uma execução pode entregar pro cérebro.

import { z } from 'zod';

export const captureKindSchema = z.enum(['agent-run', 'audit', 'test-milestone', 'impl-milestone']);
export type CaptureKind = z.infer<typeof captureKindSchema>;

export const captureResultSchema = z.enum(['green', 'yellow', 'red']);
export type CaptureResult = z.infer<typeof captureResultSchema>;

// ===== Updates atômicos opcionais =====

export const appendNextActionSchema = z.object({
  id: z.string().regex(/^N\d+[a-z]?$/, "id no formato N<num>[letra], ex: 'N16' ou 'N16a'"),
  title: z.string().min(5).max(140),
  action: z.string().min(5),
  prereq: z.string().optional(),
  expected: z.string().optional(),
  pull: z.string().min(2),
});
export type AppendNextAction = z.infer<typeof appendNextActionSchema>;

export const appendPrioritySchema = z.object({
  id: z.string().regex(/^P\d+$/, 'id no formato P<num>'),
  bucket: z.enum(['agora', 'proximo', 'depois']),
  objective: z.string().min(5).max(140),
  owner: z.string().min(2),
  depends: z.string().optional(),
  status: z.enum(['aberto', 'em curso', 'em revisao', 'bloqueado']),
});
export type AppendPriority = z.infer<typeof appendPrioritySchema>;

export const appendBlockerSchema = z.object({
  id: z.string().regex(/^B\d+$/, 'id no formato B<num>'),
  title: z.string().min(5).max(140),
  impact: z.string().min(5),
  mitigation: z.string().min(5),
  owner: z.string().min(2),
  status: z.string().default('aberto'),
});
export type AppendBlocker = z.infer<typeof appendBlockerSchema>;

// ===== Input principal do captureRun =====

export const captureInputSchema = z.object({
  // Identidade do summary
  kind: captureKindSchema,
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'slug deve ser kebab-case')
    .max(60),
  result: captureResultSchema,
  title: z.string().min(5).max(150),
  source: z.string().min(3),
  tags: z.array(z.string().min(2)).max(8),

  // Corpo do summary (markdown)
  body: z.object({
    context: z.string().min(10).max(2000),
    whatHappened: z.array(z.string().min(2)).min(1).max(20),
    findings: z.array(z.string()).max(20),
    impact: z.string().min(5).max(2000),
    references: z.array(z.string()).max(30),
  }),

  // Updates opcionais ao resto do cérebro
  sessionLogLine: z.string().min(10).max(400).optional(),
  appendNextActions: z.array(appendNextActionSchema).max(5).optional(),
  appendPriorities: z.array(appendPrioritySchema).max(5).optional(),
  appendBlockers: z.array(appendBlockerSchema).max(5).optional(),

  // Contexto multi-tenant / multi-store — resolve brainDir dinamicamente quando
  // brainDir explícito não é passado. Regras:
  //   - sem tenantId + sem brainDir  → DEFAULT_BRAIN_DIR (project brain, compat).
  //   - tenantId presente            → 07_memory/vault/tenants/<tenantId>/.
  //   - tenantId + storeId presentes → 07_memory/vault/tenants/<tenantId>/stores/<storeId>/.
  //   - brainDir explícito           → wins sobre tudo (override manual).
  tenantId: z.string().min(1).optional(),
  storeId: z.string().min(1).optional(),

  // Sobrescritas
  brainDir: z.string().optional(),
  now: z.date().optional(),
});
export type CaptureInput = z.infer<typeof captureInputSchema>;

export interface CaptureResult_ {
  summaryPath: string;
  filesUpdated: string[];
}
