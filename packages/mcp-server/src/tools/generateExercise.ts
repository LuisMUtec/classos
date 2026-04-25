import { createTool } from '@mastra/core/tools';
import { McpTools, GenerateExerciseOutput } from '@edhack/contracts';
import { supabase } from '../supabase.js';

const def = McpTools.generate_exercise;

/**
 * For now, picks an existing exercise from the lesson matching the topic + difficulty.
 *
 * TODO (luism): wire to packages/mastra `exerciseGeneratorWorkflow` when no
 * pre-authored exercise matches. The generated exercise should be persisted
 * into the `exercises` table before returning, so its id is referencable
 * by `evaluate_answer`.
 */
export const generateExerciseTool = createTool({
  id: def.name,
  description: def.description,
  inputSchema: def.input,
  outputSchema: def.output,
  execute: async ({ topic, difficulty, lesson_id }) => {
    let query = supabase()
      .from('exercises')
      .select('id, statement_md, verification_kind, difficulty')
      .eq('topic', topic)
      .eq('difficulty', difficulty)
      .limit(1);

    if (lesson_id) query = query.eq('lesson_id', lesson_id);

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch exercise: ${error.message}`);
    }

    if (!data) {
      throw new Error(
        `No pre-authored exercise found for topic="${topic}" difficulty="${difficulty}". ` +
          `Generation fallback not implemented yet (TODO: wire exerciseGeneratorWorkflow).`,
      );
    }

    return GenerateExerciseOutput.parse({
      exercise_id: data.id,
      statement_md: data.statement_md,
      verification_kind: data.verification_kind,
      difficulty: data.difficulty,
    });
  },
});
