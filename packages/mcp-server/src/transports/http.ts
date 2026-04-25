#!/usr/bin/env node
/**
 * HTTP (Streamable) transport entry point.
 *
 * Usage:
 *   PORT=4222 pnpm -C packages/mcp-server start:http
 *
 * Then point an MCP client at: http://localhost:4222/mcp
 *
 * Auth: clients MUST send `x-mcp-token: <course mcp_token>` on the initialize
 * request. The token resolves to a course_id which is bound to the resulting
 * MCP session; tools then scope their queries to that course_id.
 *
 * Subsequent requests in the same session don't need to re-send the token —
 * they carry `mcp-session-id` and the binding is in memory.
 */

import http from 'node:http';
import { randomUUID } from 'node:crypto';

import { buildServer } from '../server.js';
import { resolveTokenToCourseId, bindSession } from '../auth.js';
import { registerDefaultVerifiers } from '../verifiers/index.js';

const PORT = Number(process.env.PORT ?? 4222);
const HTTP_PATH = '/mcp';

async function main(): Promise<void> {
  registerDefaultVerifiers();
  const mcp = buildServer();

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, server: 'classos', version: '0.1.0' }));
      return;
    }

    if (url.pathname !== HTTP_PATH) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('Not found. Try /mcp or /health.');
      return;
    }

    const token = String(req.headers['x-mcp-token'] ?? '').trim();
    const incomingSessionId = String(req.headers['mcp-session-id'] ?? '').trim();

    // On the initialize request (no session id yet), validate the token,
    // pre-generate a session id, and bind it to the course BEFORE the MCP
    // SDK handles the request. This avoids depending on the
    // `onsessioninitialized` callback (which the SDK doesn't reliably fire
    // through the Mastra wrapper).
    let preGeneratedSid: string | null = null;
    if (!incomingSessionId) {
      if (!token) {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'missing_token',
            message: 'Set the `x-mcp-token` header on the initialize request.',
          }),
        );
        return;
      }
      const courseId = await resolveTokenToCourseId(token);
      if (!courseId) {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'invalid_token',
            message: 'mcp_token does not match any course.',
          }),
        );
        return;
      }
      preGeneratedSid = randomUUID();
      bindSession(preGeneratedSid, courseId);
    }

    await mcp.startHTTP({
      url,
      httpPath: HTTP_PATH,
      req,
      res,
      options: {
        sessionIdGenerator: () => preGeneratedSid ?? randomUUID(),
      },
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`[classos-mcp-http] listening on http://localhost:${PORT}${HTTP_PATH}`);
  });
}

main().catch((err) => {
  console.error('[classos-mcp-http] fatal:', err);
  process.exit(1);
});
