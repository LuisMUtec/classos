# Build context = repo root. Configure your platform with:
#   Dockerfile path:     packages/mastra/Dockerfile
#   Build context (root): repo root
#
# Required env at runtime:
#   OPENROUTER_API_KEY   key used by all agents via @openrouter/ai-sdk-provider
#   PORT                 injected by Railway (mastra start respects $PORT)
#
# Optional:
#   SUPABASE_URL                consumed by tools that read/write supabase
#   SUPABASE_SERVICE_ROLE_KEY   server-only key for those tools
#   SUPABASE_ANON_KEY           public anon key when needed
#   CLASSOS_MCP_URL             URL of the MCP server (defaults to Railway prod)

FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/mcp-server/package.json ./packages/mcp-server/
COPY packages/mastra/package.json ./packages/mastra/

RUN pnpm install --frozen-lockfile --filter=@edhack/mastra...

COPY packages/contracts ./packages/contracts
COPY packages/mcp-server ./packages/mcp-server
COPY packages/mastra ./packages/mastra

WORKDIR /app/packages/mastra
RUN pnpm build

FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/packages/mastra

CMD ["pnpm", "start"]
