import { createTool } from '@mastra/core/tools';
import { McpTools, TrackEventOutput } from '@edhack/contracts';
import { supabase } from '../supabase.js';
import { recordInteraction } from '../interactions.js';

const def = McpTools.track_event;

/**
 * Generic event tracker exposed as a tool so the LLM client can proactively
 * log notable moments (concept_understood, concept_struggle, etc.).
 */
export const trackEventTool = createTool({
  id: def.name,
  description: def.description,
  inputSchema: def.input,
  outputSchema: def.output,
  execute: async ({ student_id, type, lesson_id, exercise_id, payload }) => {
    // Resolve course_id from the student so the analytics view can scope.
    const { data: student, error: studentErr } = await supabase()
      .from('students')
      .select('course_id')
      .eq('id', student_id)
      .single();

    if (studentErr || !student) {
      throw new Error(`Student not found: ${student_id} (${studentErr?.message ?? 'no rows'})`);
    }

    const result = await recordInteraction({
      student_id,
      course_id: student.course_id,
      lesson_id,
      exercise_id,
      type,
      payload,
    });

    return TrackEventOutput.parse({
      ok: result !== null,
      interaction_id: result?.id ?? '00000000-0000-0000-0000-000000000000',
    });
  },
});
