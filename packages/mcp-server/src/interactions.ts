import { supabase } from './supabase.js';
import type { InteractionType } from '@edhack/contracts';

/**
 * Centralized interaction recorder. All tools call this to log events that
 * power the teacher's analytics dashboard.
 *
 * Failures are logged but never throw — tracking should never break the
 * student's flow.
 */
export async function recordInteraction(args: {
  student_id: string;
  course_id: string;
  lesson_id?: string;
  exercise_id?: string;
  type: InteractionType;
  payload?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const { data, error } = await supabase()
    .from('interactions')
    .insert({
      student_id: args.student_id,
      course_id: args.course_id,
      lesson_id: args.lesson_id ?? null,
      exercise_id: args.exercise_id ?? null,
      type: args.type,
      payload: args.payload ?? {},
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[mcp-server] Failed to record interaction', { args, error });
    return null;
  }
  return { id: data.id };
}
