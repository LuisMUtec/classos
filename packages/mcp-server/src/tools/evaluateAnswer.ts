import { createTool } from '@mastra/core/tools';
import { McpTools, VerificationSpec } from '@edhack/contracts';
import { supabase } from '../supabase.js';
import { verifierRegistry } from '../verifierRegistry.js';
import { recordInteraction } from '../interactions.js';
import { requireCourseContext } from '../auth.js';

const def = McpTools.evaluate_answer;

/**
 * The core differentiator: dispatches to a real verifier (sandbox execution
 * for code, SymPy for math). Result is ground truth, not LLM judgment.
 */
export const evaluateAnswerTool = createTool({
  id: def.name,
  description: def.description,
  inputSchema: def.input,
  outputSchema: def.output,
  execute: async ({ exercise_id, student_id, answer }, context) => {
    const courseId = requireCourseContext(context);

    // 1. Fetch exercise + verification spec, scoped to the session's course.
    const { data: exercise, error } = await supabase()
      .from('exercises')
      .select('id, lesson_id, verification_spec, lessons!inner(course_id)')
      .eq('id', exercise_id)
      .eq('lessons.course_id', courseId)
      .single();

    if (error || !exercise) {
      throw new Error(
        `Exercise not found in this course: ${exercise_id} (${error?.message ?? 'no rows'})`,
      );
    }

    // 2. Validate the student belongs to this course too.
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

    const spec = VerificationSpec.parse(exercise.verification_spec);

    // 3. Dispatch to the registered verifier
    const result = await verifierRegistry.verify(spec, answer);

    // 4. Track the attempt + outcome
    await recordInteraction({
      student_id,
      course_id: courseId,
      lesson_id: exercise.lesson_id,
      exercise_id,
      type: result.passed ? 'exercise_passed' : 'exercise_failed',
      payload: { feedback: result.feedback },
    });

    return result;
  },
});
