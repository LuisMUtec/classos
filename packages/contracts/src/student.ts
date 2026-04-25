import { z } from 'zod';

export const Student = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  display_name: z.string().min(1),
  anon_token: z.string().describe('opaque per-student token; identifies student to MCP server without PII'),
  created_at: z.string().datetime(),
});
export type Student = z.infer<typeof Student>;

export const Progress = z.object({
  student_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  mastery_score: z.number().min(0).max(1).describe('0-1 estimate of mastery for this lesson'),
  attempts: z.number().int().nonnegative().default(0),
  last_activity: z.string().datetime(),
});
export type Progress = z.infer<typeof Progress>;
