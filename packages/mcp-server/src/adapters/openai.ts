/**
 * OpenAI tools adapter.
 *
 * Translates the MCP tool surface to OpenAI's `tools` parameter format so
 * that LLM clients without native MCP support (OpenAI API, Gemini API, etc.)
 * can still drive the ClassOS surface via standard function calling.
 *
 * Strategy:
 *   1. Read the MCP server's tool list (`server.getToolListInfo()`).
 *   2. Convert each Zod inputSchema to JSON Schema.
 *   3. Expose:
 *      - `getOpenAITools()` → array compatible with `tools:` in OpenAI API.
 *      - `dispatchOpenAIToolCall(name, args)` → invokes server.executeTool().
 *
 * TODO (Dev B):
 *   - [ ] Implement Zod → JSON Schema conversion (zod-to-json-schema package
 *         or manual via Zod's `.toJSONSchema()` in v4).
 *   - [ ] HTTP wrapper that accepts OpenAI-format tool calls and proxies to
 *         the MCP server (so it works for ChatGPT API etc.).
 *   - [ ] Document curl example in docs/connecting-clients.md.
 *
 * This file is intentionally a stub — it owns the contract so other devs
 * know where the work lives.
 */

import { buildServer } from '../server.js';

export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export function getOpenAITools(): OpenAITool[] {
  const server = buildServer();
  const list = server.getToolListInfo();
  // TODO: convert each tool's Zod inputSchema → JSON Schema
  // For now, surface names + descriptions only so the structure is testable.
  return list.tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description ?? '',
      parameters: { type: 'object', properties: {} },
    },
  }));
}

export async function dispatchOpenAIToolCall(
  name: string,
  args: unknown,
): Promise<unknown> {
  const server = buildServer();
  return server.executeTool(name, args);
}
