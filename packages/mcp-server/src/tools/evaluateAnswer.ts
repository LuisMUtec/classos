import { createTool } from '@mastra/core/tools';
import { McpTools, VerificationSpec } from '@edhack/contracts';
import { supabase } from '../supabase.js';
import { verifierRegistry } from '../verifierRegistry.js';
import { recordInteraction } from '../interactions.js';

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
  execute: async ({ exercise_id, student_id, answer }) => {
    // 1. Fetch exercise + verification spec
    const { data: exercise, error } = await supabase()
      .from('exercises')
      .select('id, lesson_id, verification_spec, course_id:lessons!inner(course_id)')
      .eq('id', exercise_id)
      .single();

    if (error || !exercise) {
      throw new Error(`Exercise not found: ${exercise_id} (${error?.message ?? 'no rows'})`);
    }

    const spec = VerificationSpec.parse(exercise.verification_spec);

    // 2. Dispatch to the registered verifier
    const result = await verifierRegistry.verify(spec, answer);

    // 3. Track the attempt + outcome
    const courseId = (exercise as unknown as { course_id: { course_id: string } }).course_id?.course_id;
    if (courseId) {
      await recordInteraction({
        student_id,
        course_id: courseId,
        lesson_id: exercise.lesson_id,
        exercise_id,
        type: result.passed ? 'exercise_passed' : 'exercise_failed',
        payload: { feedback: result.feedback },
      });
    }

    return result;
  },
});
