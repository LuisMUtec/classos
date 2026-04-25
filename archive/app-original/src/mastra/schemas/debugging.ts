import { z } from 'zod';

export const DebuggingInputSchema = z.object({
  buggyCode: z.string().min(1),
  expectedBehavior: z.string().default(''),
});

export const BugReportSchema = z.object({
  bugType: z.enum(['syntax', 'runtime', 'logic']),
  line: z.number().int().min(0),
  evidence: z.string(),
  traceback: z.string().optional(),
});

export const ConceptTagSchema = z.object({
  concept: z.string(),
  category: z.enum([
    'off-by-one',
    'mutación-compartida',
    'scope',
    'recursión',
    'tipo-incorrecto',
    'iteración-incorrecta',
    'otro',
  ]),
  pedagogicalReference: z.string(),
});

export const ProgressiveHintSchema = z.object({
  level: z.enum(['L1', 'L2', 'L3']),
  text: z.string(),
});

export const ProgressiveHintsSchema = z.object({
  hints: z.array(ProgressiveHintSchema).length(3),
});

export const VerifierDecisionSchema = z.object({
  accepted: z.boolean(),
  rejectionReason: z.string().optional(),
  feedbackForHinter: z.string().optional(),
  verifiedHints: ProgressiveHintsSchema.optional(),
  applicationProof: z
    .object({ codeAfterApply: z.string(), exitCode: z.number().int(), durationMs: z.number().int() })
    .optional(),
});

export const VerifiedHintsPackageSchema = z.object({
  bugReport: BugReportSchema,
  conceptTag: ConceptTagSchema,
  hints: z.array(ProgressiveHintSchema).length(3),
  verification: z.object({
    accepted: z.literal(true),
    applicationProof: z.object({
      codeAfterApply: z.string(),
      exitCode: z.number().int(),
      durationMs: z.number().int(),
    }),
  }),
  iterationCount: z.number().int().min(1),
});

export type DebuggingInput = z.infer<typeof DebuggingInputSchema>;
export type BugReport = z.infer<typeof BugReportSchema>;
export type ConceptTag = z.infer<typeof ConceptTagSchema>;
export type ProgressiveHint = z.infer<typeof ProgressiveHintSchema>;
export type VerifierDecision = z.infer<typeof VerifierDecisionSchema>;
export type VerifiedHintsPackage = z.infer<typeof VerifiedHintsPackageSchema>;
