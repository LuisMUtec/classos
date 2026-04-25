# @edhack/mcp-server

The ClassOS MCP server. Exposes 5 tools (and resources, soon) to any MCP client so an LLM can drive a teacher-authored course.

## Tools

| Tool | What it does | Owner |
|---|---|---|
| `get_lesson_context` | Read teacher-authored lesson content | luism |
| `generate_exercise` | Pick or generate an exercise for the student | luism (TODO: wire generator) |
| `evaluate_answer` | Run the verifier (sandbox / sympy) and return ground truth | luism (registry) + Dev C (verifiers) |
| `get_hint` | Progressive hint (L1/L2/L3) | luism (TODO: wire hinter agent) |
| `track_event` | Log a learning event for analytics | luism |

## Layout

```
src/
├── server.ts            # buildServer() — MCPServer instance with all 5 tools
├── supabase.ts          # lazy supabase client
├── verifierRegistry.ts  # Map<VerificationKind, Verifier> (Dev C plugs in)
├── interactions.ts      # recordInteraction() — single point of analytics writes
├── tools/               # 5 tools, each ~30 lines
│   ├── getLessonContext.ts
│   ├── generateExercise.ts
│   ├── evaluateAnswer.ts
│   ├── getHint.ts
│   └── trackEvent.ts
├── transports/          # ← Dev B owns
│   ├── stdio.ts         # entry: claude desktop, cursor
│   └── http.ts          # entry: hosted (streamable HTTP)
└── adapters/            # ← Dev B owns
    └── openai.ts        # MCP tools → OpenAI tools format
```

## Run locally

```bash
cp ../../.env.example ../../.env  # set SUPABASE_URL + SUPABASE_ANON_KEY
pnpm install
pnpm -C packages/mcp-server dev   # stdio transport with watch
# or
pnpm -C packages/mcp-server start:http   # HTTP on PORT (default 4222)
```

## Connect Claude Desktop

```json
{
  "mcpServers": {
    "classos": {
      "command": "npx",
      "args": ["tsx", "/abs/path/to/packages/mcp-server/src/transports/stdio.ts"],
      "env": {
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_ANON_KEY": "eyJ..."
      }
    }
  }
}
```

Then restart Claude Desktop. The 5 tools should appear in the tools menu.

## How verifiers plug in (Dev C)

```ts
// packages/verifiers/src/index.ts
import { verifierRegistry } from '@edhack/mcp-server';
import { pythonTestsVerifier } from './python-tests.js';
import { sympyEquivalenceVerifier } from './sympy.js';

export function registerDefaultVerifiers(): void {
  verifierRegistry.register(pythonTestsVerifier);
  verifierRegistry.register(sympyEquivalenceVerifier);
}
```

Then in `transports/stdio.ts` and `transports/http.ts`, call
`registerDefaultVerifiers()` before `buildServer()`.
