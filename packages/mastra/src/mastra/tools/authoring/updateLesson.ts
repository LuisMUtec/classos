import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { supabase } from '../../supabase.js';

export const updateLessonTool = createTool({
  id: 'updateLesson',
  description:
    'Actualiza una lección por id. Solo aplica los campos provistos (patch). ' +
    'Si el docente menciona una lección por nombre y no por id, primero llama listLessons para resolver el id.',
  inputSchema: z.object({
    lesson_id: z.string().uuid(),
    title: z.string().min(1).optional(),
    content_md: z.string().optional(),
    objectives: z.array(z.string()).optional(),
    order: z.number().int().nonnegative().optional(),
  }),
  outputSchema: z.object({
    lesson_id: z.string().uuid(),
    title: z.string(),
    content_md: z.string(),
    objectives: z.array(z.string()),
    order: z.number().int(),
  }),
  execute: async ({ lesson_id, ...patch }) => {
    const cleaned = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(cleaned).length === 0) {
      throw new Error('updateLesson: patch vacío');
    }
    const { data, error } = await supabase()
      .from('lessons')
      .update(cleaned)
      .eq('id', lesson_id)
      .select('id, title, content_md, objectives, "order"')
      .maybeSingle();
    if (error) throw new Error(`updateLesson: ${error.message}`);
    if (!data) throw new Error(`updateLesson: lesson_id no existe (${lesson_id})`);
    return {
      lesson_id: data.id as string,
      title: data.title as string,
      content_md: data.content_md as string,
      objectives: (data.objectives as string[]) ?? [],
      order: Number(data.order),
    };
  },
});
