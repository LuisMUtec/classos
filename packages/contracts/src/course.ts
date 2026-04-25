import { z } from 'zod';
import { Subject, Difficulty } from './subject.js';
import { VerificationSpec } from './verification.js';

export const Course = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  name: z.string().min(1),
  subject: Subject,
  syllabus_md: z.string().default(''),
  mcp_token: z.string().describe('opaque token used by MCP clients to auth + scope to this course'),
  created_at: z.string().datetime(),
});
export type Course = z.infer<typeof Course>;

export const Lesson = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  content_md: z.string(),
  objectives: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
});
export type Lesson = z.infer<typeof Lesson>;

export const Exercise = z.object({
  id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  topic: z.string().describe('short slug, e.g. "recursion", "factoring"'),
  statement_md: z.string().describe('exercise statement shown to the student'),
  difficulty: Difficulty.default('medium'),
  verification_spec: VerificationSpec,
  created_at: z.string().datetime(),
});
export type Exercise = z.infer<typeof Exercise>;
