import { z } from 'zod';
import { Difficulty } from './subject.js';
import { VerificationKind, VerificationResult } from './verification.js';
import { InteractionType } from './events.js';

/**
 * MCP tool input/output schemas + descriptions.
 *
 * The `description` for each tool is what the LLM client reads to decide
 * whether to call it. Descriptions are part of the *product*, not just docs —
 * edit them carefully and test that the client picks the right tool.
 */

// ─── get_lesson_context ──────────────────────────────────────────────────────

export const GetLessonContextInput = z.object({
  lesson_id: z.string().uuid(),
});
export type GetLessonContextInput = z.infer<typeof GetLessonContextInput>;

export const GetLessonContextOutput = z.object({
  title: z.string(),
  content_md: z.string(),
  objectives: z.array(z.string()),
});
export type GetLessonContextOutput = z.infer<typeof GetLessonContextOutput>;

// ─── generate_exercise ───────────────────────────────────────────────────────

export const GenerateExerciseInput = z.object({
  topic: z.string().describe('e.g. "recursion", "factoring"'),
  difficulty: Difficulty.default('medium'),
  lesson_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
});
export type GenerateExerciseInput = z.infer<typeof GenerateExerciseInput>;

export const GenerateExerciseOutput = z.object({
  exercise_id: z.string().uuid(),
  statement_md: z.string(),
  verification_kind: VerificationKind,
  difficulty: Difficulty,
});
export type GenerateExerciseOutput = z.infer<typeof GenerateExerciseOutput>;

// ─── evaluate_answer ─────────────────────────────────────────────────────────

export const EvaluateAnswerInput = z.object({
  exercise_id: z.string().uuid(),
  student_id: z.string().uuid(),
  answer: z.string().describe('raw student answer (code, expression, or text)'),
});
export type EvaluateAnswerInput = z.infer<typeof EvaluateAnswerInput>;

export const EvaluateAnswerOutput = VerificationResult;
export type EvaluateAnswerOutput = z.infer<typeof EvaluateAnswerOutput>;

// ─── get_hint ────────────────────────────────────────────────────────────────

export const GetHintInput = z.object({
  exercise_id: z.string().uuid(),
  student_id: z.string().uuid(),
  level: z.number().int().min(1).max(3).default(1),
});
export type GetHintInput = z.infer<typeof GetHintInput>;

export const GetHintOutput = z.object({
  hint: z.string(),
  level: z.number().int().min(1).max(3),
});
export type GetHintOutput = z.infer<typeof GetHintOutput>;

// ─── track_event ─────────────────────────────────────────────────────────────

export const TrackEventInput = z.object({
  student_id: z.string().uuid(),
  type: InteractionType,
  lesson_id: z.string().uuid().optional(),
  exercise_id: z.string().uuid().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
});
export type TrackEventInput = z.infer<typeof TrackEventInput>;

export const TrackEventOutput = z.object({
  ok: z.boolean(),
  interaction_id: z.string().uuid(),
});
export type TrackEventOutput = z.infer<typeof TrackEventOutput>;

// ─── Tool registry ───────────────────────────────────────────────────────────

export const McpToolNames = [
  'get_lesson_context',
  'generate_exercise',
  'evaluate_answer',
  'get_hint',
  'track_event',
] as const;
export type McpToolName = (typeof McpToolNames)[number];

/**
 * Centralized tool definitions. The MCP server registers these directly;
 * the OpenAI adapter translates them into OpenAI tool format.
 */
export const McpTools = {
  get_lesson_context: {
    name: 'get_lesson_context',
    description:
      'Retrieve the teacher-authored content for a specific lesson, including learning objectives. Use this whenever the student asks about a topic — your answers must be grounded in what the teacher actually taught, not generic knowledge. Call this BEFORE explaining any concept.',
    input: GetLessonContextInput,
    output: GetLessonContextOutput,
  },
  generate_exercise: {
    name: 'generate_exercise',
    description:
      'Generate a new exercise for the student to practice. Use this when the student asks to practice, when you assess they need reinforcement on a concept, or after they finish a lesson section. The returned `exercise_id` MUST be passed to `evaluate_answer` and `get_hint`.',
    input: GenerateExerciseInput,
    output: GenerateExerciseOutput,
  },
  evaluate_answer: {
    name: 'evaluate_answer',
    description:
      "Submit the student's answer to an exercise for verification. The system runs the actual verifier — for code exercises it executes the code in a sandbox against tests; for math it checks symbolic equivalence with SymPy. ALWAYS call this when the student attempts an exercise. NEVER judge their answer yourself — let the verifier be the source of truth, then explain its result.",
    input: EvaluateAnswerInput,
    output: EvaluateAnswerOutput,
  },
  get_hint: {
    name: 'get_hint',
    description:
      'Request a progressive hint for an exercise the student is stuck on. Level 1 is a guiding question, level 2 points to the relevant concept, level 3 explains the technique without giving the full answer. Escalate gradually — start at level 1, only go to level 2 after the student is still stuck.',
    input: GetHintInput,
    output: GetHintOutput,
  },
  track_event: {
    name: 'track_event',
    description:
      "Log a learning event for the teacher's analytics dashboard. Call this proactively at meaningful moments: when the student grasps a concept (`concept_understood`), when they struggle repeatedly with the same concept (`concept_struggle`), when they request hints. The teacher uses these signals to improve the lesson.",
    input: TrackEventInput,
    output: TrackEventOutput,
  },
} as const;
