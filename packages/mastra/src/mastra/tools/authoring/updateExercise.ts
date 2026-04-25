import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { supabase } from '../../supabase.js';

export const updateExerciseTool = createTool({
  id: 'updateExercise',
  description:
    'Actualiza un ejercicio por id. Patch parcial (statement_md, difficulty, topic, verification_spec).',
  inputSchema: z.object({
    exercise_id: z.string().uuid(),
    topic: z.string().optional(),
    statement_md: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    verification_spec: z.unknown().optional(),
  }),
  outputSchema: z.object({
    exercise_id: z.string().uuid(),
    topic: z.string(),
    statement_md: z.string(),
    difficulty: z.string(),
    verification_kind: z.string(),
  }),
  execute: async ({ exercise_id, ...patch }) => {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) cleaned[k] = v;
    }
    // Si el patch incluye verification_spec, sincroniza verification_kind con su `kind`.
    if (cleaned.verification_spec && typeof cleaned.verification_spec === 'object') {
      const kind = (cleaned.verification_spec as { kind?: string }).kind;
      if (kind) cleaned.verification_kind = kind;
    }
    if (Object.keys(cleaned).length === 0) {
      throw new Error('updateExercise: patch vacío');
    }
    const { data, error } = await supabase()
      .from('exercises')
      .update(cleaned)
      .eq('id', exercise_id)
      .select('id, topic, statement_md, difficulty, verification_kind')
      .maybeSingle();
    if (error) throw new Error(`updateExercise: ${error.message}`);
    if (!data) throw new Error(`updateExercise: exercise_id no existe (${exercise_id})`);
    return {
      exercise_id: data.id as string,
      topic: data.topic as string,
      statement_md: data.statement_md as string,
      difficulty: data.difficulty as string,
      verification_kind: data.verification_kind as string,
    };
  },
});
