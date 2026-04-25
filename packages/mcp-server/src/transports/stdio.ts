#!/usr/bin/env node
/**
 * stdio transport entry point.
 *
 * Usage in Claude Desktop config (~/Library/Application Support/Claude/claude_desktop_config.json):
 *
 *   {
 *     "mcpServers": {
 *       "classos": {
 *         "command": "node",
 *         "args": ["/abs/path/to/packages/mcp-server/src/transports/stdio.ts"],
 *         "env": {
 *           "SUPABASE_URL": "https://xxx.supabase.co",
 *           "SUPABASE_ANON_KEY": "eyJ..."
 *         }
 *       }
 *     }
 *   }
 *
 * For dev: `pnpm -C packages/mcp-server dev` (runs via tsx with watch).
 *
 * TODO (Dev B): once verifiers are registered (Dev C), this entry should
 * also import `registerDefaultVerifiers()` from packages/verifiers and
 * call it before `startStdio()`.
 */

import { buildServer } from '../server.js';
import { registerDefaultVerifiers } from '../verifiers/index.js';

async function main(): Promise<void> {
  registerDefaultVerifiers();
  const server = buildServer();
  await server.startStdio();
}

main().catch((err) => {
  // stderr is the only safe channel under stdio transport — stdout is the protocol.
  console.error('[classos-mcp-stdio] fatal:', err);
  process.exit(1);
});
