import { getSupabase, isSupabaseConfigured } from './supabase/client';

export interface RunRow {
  id: string;
  created_at: string;
  pipeline_id: string;
  mastra_run_id: string | null;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  markdown: string | null;
  iteration_count: number;
  exec_exit_code: number | null;
  exec_duration_ms: number | null;
  elapsed_ms: number | null;
  topic: string | null;
  title: string | null;
}

export type NewRun = Omit<RunRow, 'id' | 'created_at'>;

const TABLE = 'runs';

export async function saveRun(row: NewRun): Promise<RunRow | null> {
  if (!isSupabaseConfigured()) {
    console.warn('[runs] Supabase no configurado — skip save');
    return null;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) {
    console.error('[runs] insert failed:', error.message);
    return null;
  }
  return data as RunRow;
}

export async function listRuns(opts: { pipelineId?: string; limit?: number } = {}): Promise<RunRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();
  let q = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (opts.pipelineId) q = q.eq('pipeline_id', opts.pipelineId);
  q = q.limit(opts.limit ?? 50);
  const { data, error } = await q;
  if (error) {
    console.error('[runs] list failed:', error.message);
    return [];
  }
  return (data ?? []) as RunRow[];
}

export async function getRun(id: string): Promise<RunRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('[runs] get failed:', error.message);
    return null;
  }
  return (data as RunRow) ?? null;
}
