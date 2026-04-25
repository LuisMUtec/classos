#!/usr/bin/env node
/**
 * HTTP (Streamable) transport entry point.
 *
 * Usage:
 *   PORT=4222 pnpm -C packages/mcp-server start:http
 *
 * Then point an MCP client at: http://localhost:4222/mcp
 *
 * TODO (Dev B):
 *   - [ ] Auth: extract `mcp_token` from query/header, look up course, expose
 *         course_id via context.mcp.extra so tools can scope queries.
 *   - [ ] Multiple sessions per course (one student per session via student
 *         anon_token).
 *   - [ ] Deploy target (Railway/Fly/Vercel Edge — pick one).
 *   - [ ] CORS for browser-based clients if needed.
 */

import http from 'node:http';
import { buildServer } from '../server.js';

const PORT = Number(process.env.PORT ?? 4222);
const HTTP_PATH = '/mcp';

async function main(): Promise<void> {
  const mcp = buildServer();

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, server: 'classos', version: '0.1.0' }));
      return;
    }

    if (url.pathname === HTTP_PATH) {
      await mcp.startHTTP({ url, httpPath: HTTP_PATH, req, res });
      return;
    }

    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found. Try /mcp or /health.');
  });

  httpServer.listen(PORT, () => {
    console.log(`[classos-mcp-http] listening on http://localhost:${PORT}${HTTP_PATH}`);
  });
}

main().catch((err) => {
  console.error('[classos-mcp-http] fatal:', err);
  process.exit(1);
});
