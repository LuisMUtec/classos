/**
 * MCP token auth.
 *
 * Each course has an `mcp_token` (UNIQUE in DB). The HTTP transport reads
 * `x-mcp-token` on the initialize request, looks up the course, and binds
 * the resulting session to that course_id.
 *
 * Tools then call `requireCourseContext(context)` to retrieve the course_id
 * scoped to the current MCP session, and apply it as a WHERE filter.
 *
 * Caches:
 *   - tokenToCourseCache: avoids re-querying Supabase on every initialize.
 *   - sessionToCourseId:  per-session binding so subsequent tool calls (which
 *     don't carry the token header) can still resolve course_id from sessionId.
 *
 * Eviction is intentionally absent for the hackathon. Restart the server to
 * flush.
 */

import { supabase } from './supabase.js';

const tokenToCourseCache = new Map<string, string>();
const sessionToCourseId = new Map<string, string>();

export async function resolveTokenToCourseId(token: string): Promise<string | null> {
  if (!token) return null;
  const cached = tokenToCourseCache.get(token);
  if (cached) return cached;

  const { data, error } = await supabase()
    .from('courses')
    .select('id')
    .eq('mcp_token', token)
    .maybeSingle();

  if (error) {
    console.error('[auth] supabase lookup failed:', error.message);
    return null;
  }
  if (!data) return null;

  tokenToCourseCache.set(token, data.id);
  return data.id;
}

export function bindSession(sessionId: string, courseId: string): void {
  sessionToCourseId.set(sessionId, courseId);
}

export function getCourseForSession(sessionId: string | undefined | null): string | null {
  if (!sessionId) return null;
  return sessionToCourseId.get(sessionId) ?? null;
}

/**
 * Pulls course_id from the MCP request context. Throws if the session is
 * unbound (e.g. no token sent on initialize, or session not recognized).
 *
 * Compatible with both call patterns documented in @mastra/mcp:
 *   - Direct MCP call:  context.mcp.extra.sessionId
 *   - Agent tool call:  context.requestContext.get('mcp.extra').sessionId
 */
export function requireCourseContext(context: unknown): string {
  const ctx = context as {
    mcp?: { extra?: { sessionId?: string } };
    requestContext?: { get?: (key: string) => { sessionId?: string } | undefined };
  };

  const sessionId =
    ctx?.mcp?.extra?.sessionId ?? ctx?.requestContext?.get?.('mcp.extra')?.sessionId ?? null;

  const courseId = getCourseForSession(sessionId);
  if (!courseId) {
    throw new Error(
      'Unauthorized: no course context. Ensure the MCP client sends `x-mcp-token` ' +
        'on the initialize request.',
    );
  }
  return courseId;
}
