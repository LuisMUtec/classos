import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { supabase } from '../../supabase.js';

export const listLessonsTool = createTool({
  id: 'listLessons',
  description:
    'Devuelve las lecciones de un curso (id, order, title, objectives). ' +
    'Úsala cuando el docente pida ver qué tiene, o cuando necesites resolver una referencia por nombre antes de editar/borrar.',
  inputSchema: z.object({
    course_id: z.string().uuid(),
  }),
  outputSchema: z.object({
    lessons: z.array(
      z.object({
        lesson_id: z.string().uuid(),
        order: z.number().int(),
        title: z.string(),
        objectives: z.array(z.string()).default([]),
      }),
    ),
  }),
  execute: async ({ course_id }) => {
    const { data, error } = await supabase()
      .from('lessons')
      .select('id, "order", title, objectives')
      .eq('course_id', course_id)
      .order('order');
    if (error) throw new Error(`listLessons: ${error.message}`);
    return {
      lessons: (data ?? []).map((l) => ({
        lesson_id: l.id as string,
        order: Number(l.order),
        title: l.title as string,
        objectives: (l.objectives as string[]) ?? [],
      })),
    };
  },
});
