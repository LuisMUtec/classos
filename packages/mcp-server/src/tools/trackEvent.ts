import { createTool } from '@mastra/core/tools';
import { McpTools, TrackEventOutput } from '@edhack/contracts';
import { supabase } from '../supabase.js';
import { recordInteraction } from '../interactions.js';
import { requireCourseContext } from '../auth.js';

const def = McpTools.track_event;

/**
 * Generic event tracker exposed as a tool so the LLM client can proactively
 * log notable moments (concept_understood, concept_struggle, etc.).
 *
 * The course_id is forced from the session context — clients can't spoof it.
 * The student must belong to the same course, otherwise the call is rejected.
 */
export const trackEventTool = createTool({
  id: def.name,
  description: def.description,
  inputSchema: def.input,
  outputSchema: def.output,
  execute: async ({ student_id, type, lesson_id, exercise_id, payload }, context) => {
    const courseId = requireCourseContext(context);

    const { data: student, error: studentErr } = await supabase()
      .from('students')
      .select('id')
      .eq('id', student_id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (studentErr || !student) {
      throw new Error(
        `Student not found in this course: ${student_id} (${studentErr?.message ?? 'no rows'})`,
      );
    }

    const result = await recordInteraction({
      student_id,
      course_id: courseId,
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
