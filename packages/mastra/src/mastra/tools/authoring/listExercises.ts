import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { supabase } from '../../supabase.js';

export const listExercisesTool = createTool({
  id: 'listExercises',
  description:
    'Devuelve los ejercicios de una lección (id, topic, statement_md, difficulty, verification_kind).',
  inputSchema: z.object({
    lesson_id: z.string().uuid(),
  }),
  outputSchema: z.object({
    exercises: z.array(
      z.object({
        exercise_id: z.string().uuid(),
        topic: z.string(),
        statement_md: z.string(),
        difficulty: z.string(),
        verification_kind: z.string(),
      }),
    ),
  }),
  execute: async ({ lesson_id }) => {
    const { data, error } = await supabase()
      .from('exercises')
      .select('id, topic, statement_md, difficulty, verification_kind')
      .eq('lesson_id', lesson_id);
    if (error) throw new Error(`listExercises: ${error.message}`);
    return {
      exercises: (data ?? []).map((e) => ({
        exercise_id: e.id as string,
        topic: e.topic as string,
        statement_md: e.statement_md as string,
        difficulty: e.difficulty as string,
        verification_kind: e.verification_kind as string,
      })),
    };
  },
});
