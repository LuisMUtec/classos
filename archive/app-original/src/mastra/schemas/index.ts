import { z } from 'zod';

export const TopicSchema = z.enum([
  'condicionales',
  'loops',
  'funciones',
  'listas',
  'strings',
  'dicts',
  'recursion',
  'oop-basico',
]);
export type Topic = z.infer<typeof TopicSchema>;

export const LevelSchema = z.enum(['intro-universitario']);
export type Level = z.infer<typeof LevelSchema>;

export const TeacherInputSchema = z.object({
  topic: TopicSchema,
  level: LevelSchema,
  durationMinutes: z.number().int().min(15).max(180),
  constraints: z.array(z.string()).default([]),
  demoMode: z.boolean().default(false),
});
export type TeacherInput = z.infer<typeof TeacherInputSchema>;

export const ScenarioCandidateSchema = z.object({
  title: z.string(),
  context: z.string(),
  rationale: z.string(),
  estimatedFitMinutes: z.number().int(),
});
export type ScenarioCandidate = z.infer<typeof ScenarioCandidateSchema>;

export const ScenarioCandidatesSchema = z.object({
  topic: TopicSchema,
  candidates: z.array(ScenarioCandidateSchema).min(2).max(5),
  selectedIndex: z.number().int().min(0),
});
export type ScenarioCandidates = z.infer<typeof ScenarioCandidatesSchema>;

export const ProblemExampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});
export type ProblemExample = z.infer<typeof ProblemExampleSchema>;

export const ProblemStatementSchema = z.object({
  title: z.string(),
  story: z.string(),
  ioSpec: z.string(),
  examples: z.array(ProblemExampleSchema).min(2).max(5),
  constraints: z.array(z.string()),
  functionSignature: z.string(),
  iteration: z.number().int().min(1),
  previousFeedback: z.string().optional(),
});
export type ProblemStatement = z.infer<typeof ProblemStatementSchema>;

export const TestCaseSchema = z.object({
  description: z.string(),
  code: z.string(),
});
export type TestCase = z.infer<typeof TestCaseSchema>;

export const ExecutionResultSchema = z.object({
  exitCode: z.number().int(),
  stdout: z.string(),
  stderr: z.string(),
  timedOut: z.boolean(),
  durationMs: z.number(),
});
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

export const SolverDecisionSchema = z.object({
  accepted: z.boolean(),
  // Cuando accepted=true:
  solutionCode: z.string().optional(),
  tests: z.array(TestCaseSchema).optional(),
  execution: ExecutionResultSchema.optional(),
  // Cuando accepted=false:
  rejectionReason: z
    .enum(['ambiguous-spec', 'unsolvable', 'tests-failed', 'spec-contradiction'])
    .optional(),
  feedbackForDesigner: z.string().optional(),
  attemptedSolution: z.string().optional(),
  failedExecution: ExecutionResultSchema.optional(),
});
export type SolverDecision = z.infer<typeof SolverDecisionSchema>;

export const SolutionPackageSchema = z.object({
  problem: ProblemStatementSchema,
  decision: SolverDecisionSchema,
  iterationCount: z.number().int().min(1),
});
export type SolutionPackage = z.infer<typeof SolutionPackageSchema>;

export const RubricCriterionSchema = z.object({
  criterion: z.string(),
  levels: z.object({
    excelente: z.string(),
    aceptable: z.string(),
    insuficiente: z.string(),
  }),
});
export type RubricCriterion = z.infer<typeof RubricCriterionSchema>;

export const CommonErrorSchema = z.object({
  error: z.string(),
  whyHappens: z.string(),
  howToGuide: z.string(),
});
export type CommonError = z.infer<typeof CommonErrorSchema>;

export const ProgressiveHintSchema = z.object({
  level: z.enum(['L1-pregunta-general', 'L2-zona-sospechosa', 'L3-concepto-sin-fix']),
  hint: z.string(),
});
export type ProgressiveHint = z.infer<typeof ProgressiveHintSchema>;

export const TeacherPackageSchema = z.object({
  solution: SolutionPackageSchema,
  rubric: z.array(RubricCriterionSchema).min(2),
  commonErrors: z.array(CommonErrorSchema).min(2),
  progressiveHints: z.array(ProgressiveHintSchema).length(3),
  extensions: z.array(z.string()).min(1),
});
export type TeacherPackage = z.infer<typeof TeacherPackageSchema>;
