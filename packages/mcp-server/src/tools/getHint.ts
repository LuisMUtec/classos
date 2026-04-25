import { createTool } from '@mastra/core/tools';
import { McpTools, GetHintOutput } from '@edhack/contracts';
import { supabase } from '../supabase.js';
import { recordInteraction } from '../interactions.js';

const def = McpTools.get_hint;

/**
 * Returns a progressive hint for an exercise.
 *
 * TODO (luism): wire to packages/mastra `hinterAgent` so the hint is
 * dynamically generated from the exercise statement + student's prior
 * attempts. For now, returns a placeholder so the surface is complete.
 */
export const getHintTool = createTool({
  id: def.name,
  description: def.description,
  inputSchema: def.input,
  outputSchema: def.output,
  execute: async ({ exercise_id, student_id, level }) => {
    const { data: exercise, error } = await supabase()
      .from('exercises')
      .select('id, lesson_id, statement_md, course_id:lessons!inner(course_id)')
      .eq('id', exercise_id)
      .single();

    if (error || !exercise) {
      throw new Error(`Exercise not found: ${exercise_id} (${error?.message ?? 'no rows'})`);
    }

    const placeholder = (() => {
      switch (level) {
        case 1:
          return '¿Qué tipo de problema reconoces aquí? Piensa en la estructura antes de la solución.';
        case 2:
          return 'Identifica qué técnica del temario aplica aquí. Revisa los objetivos de la lección.';
        case 3:
          return 'Aplica la técnica paso a paso, sin saltarte el caso base/condición de parada.';
      }
    })();

    const courseId = (exercise as unknown as { course_id: { course_id: string } }).course_id?.course_id;
    if (courseId) {
      await recordInteraction({
        student_id,
        course_id: courseId,
        lesson_id: exercise.lesson_id,
        exercise_id,
        type: 'hint_requested',
        payload: { level },
      });
    }

    return GetHintOutput.parse({ hint: placeholder, level });
  },
});
