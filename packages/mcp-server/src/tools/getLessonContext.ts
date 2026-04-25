import { createTool } from '@mastra/core/tools';
import { McpTools, GetLessonContextOutput } from '@edhack/contracts';
import { supabase } from '../supabase.js';

const def = McpTools.get_lesson_context;

export const getLessonContextTool = createTool({
  id: def.name,
  description: def.description,
  inputSchema: def.input,
  outputSchema: def.output,
  execute: async ({ lesson_id }) => {
    const { data, error } = await supabase()
      .from('lessons')
      .select('title, content_md, objectives')
      .eq('id', lesson_id)
      .single();

    if (error || !data) {
      throw new Error(`Lesson not found: ${lesson_id} (${error?.message ?? 'no rows'})`);
    }

    return GetLessonContextOutput.parse({
      title: data.title,
      content_md: data.content_md,
      objectives: data.objectives ?? [],
    });
  },
});
