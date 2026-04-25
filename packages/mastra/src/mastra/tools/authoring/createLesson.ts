import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { supabase } from '../../supabase.js';

export const createLessonTool = createTool({
  id: 'createLesson',
  description:
    'Crea una lección dentro de un curso. Usa esto cuando el docente pida agregar lecciones. ' +
    'Si no se da `order`, se asigna el siguiente disponible. Llama esta tool una vez por lección — para 3 lecciones, 3 llamadas.',
  inputSchema: z.object({
    course_id: z.string().uuid().describe('ID del curso al que pertenece la lección.'),
    title: z.string().min(1).describe('Título corto de la lección.'),
    content_md: z
      .string()
      .default('')
      .describe('Contenido en markdown. Si el docente no especifica, escribe un esquema breve (3-5 líneas) que el docente pueda refinar después.'),
    objectives: z
      .array(z.string())
      .default([])
      .describe('Objetivos de aprendizaje (1 por string). Vacío si el docente no los dio.'),
    order: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe('Posición. Si se omite, se calcula como el siguiente entero después del último.'),
  }),
  outputSchema: z.object({
    lesson_id: z.string().uuid(),
    course_id: z.string().uuid(),
    title: z.string(),
    order: z.number().int(),
  }),
  execute: async ({ course_id, title, content_md, objectives, order }) => {
    const c = supabase();
    let nextOrder = order;
    if (nextOrder === undefined) {
      const { data: existing } = await c
        .from('lessons')
        .select('"order"')
        .eq('course_id', course_id)
        .order('order', { ascending: false })
        .limit(1);
      nextOrder = existing && existing.length > 0 ? Number(existing[0].order) + 1 : 0;
    }
    const { data, error } = await c
      .from('lessons')
      .insert({
        course_id,
        title,
        content_md,
        objectives,
        order: nextOrder,
      })
      .select('id, course_id, title, "order"')
      .single();
    if (error || !data) {
      throw new Error(`createLesson: ${error?.message ?? 'no row'}`);
    }
    return {
      lesson_id: data.id as string,
      course_id: data.course_id as string,
      title: data.title as string,
      order: Number(data.order),
    };
  },
});
