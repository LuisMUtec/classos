import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/**
 * Lazy supabase client. Reads SUPABASE_URL + SUPABASE_ANON_KEY from env.
 * Throws on first access if env is missing — fail loud during boot, not at request time.
 */
export function supabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      '[mcp-server] Missing SUPABASE_URL or SUPABASE_ANON_KEY in env. ' +
        'See .env.example.',
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
