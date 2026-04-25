import { z } from 'zod';

/**
 * Types of trackable interactions. New types should be additive — don't rename
 * existing ones, since the analytics dashboard groups by type.
 */
export const InteractionType = z.enum([
  'tool_call',           // generic: an MCP tool was called
  'context_requested',   // student (via LLM) pulled lesson content
  'exercise_generated',  // a new exercise was generated for the student
  'exercise_attempted',  // student submitted an answer
  'exercise_passed',     // verifier returned passed=true
  'exercise_failed',     // verifier returned passed=false
  'hint_requested',      // student asked for a hint (level included in payload)
  'concept_struggle',    // LLM detected the student is struggling with a concept
  'concept_understood',  // LLM detected the student grasped a concept
]);
export type InteractionType = z.infer<typeof InteractionType>;

export const Interaction = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  lesson_id: z.string().uuid().optional(),
  exercise_id: z.string().uuid().optional(),
  type: InteractionType,
  payload: z.record(z.string(), z.unknown()).default({}),
  created_at: z.string().datetime(),
});
export type Interaction = z.infer<typeof Interaction>;
