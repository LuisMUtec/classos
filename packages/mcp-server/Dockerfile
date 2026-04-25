# Build context = repo root. Configure your platform with:
#   Dockerfile path:     packages/mcp-server/Dockerfile
#   Build context (root): repo root
#
# Required env at runtime:
#   SUPABASE_URL              your Supabase project URL
#   SUPABASE_ANON_KEY         anon key (read for public tables)
#   PORT                      injected by Railway/Render/Fly
#
# Optional:
#   SUPABASE_SERVICE_ROLE_KEY (when service-role auth is wired up)
#   MASTRA_URL                if generate_exercise falls back to a workflow

FROM node:22-alpine

# python_tests verifier shells out to pytest. py3-pytest pulls python3 + the
# stdlib it needs; nothing else from PyPI required for this verifier.
RUN apk add --no-cache python3 py3-pytest

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy lockfile + workspace metadata first so install layer caches well.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/mcp-server/package.json ./packages/mcp-server/

RUN pnpm install --frozen-lockfile --filter=@edhack/mcp-server...

# Copy sources (workspace deps + this package)
COPY packages/contracts ./packages/contracts
COPY packages/mcp-server ./packages/mcp-server

WORKDIR /app/packages/mcp-server

# tsx runs TypeScript directly — no compile step needed for ESM-only package.
CMD ["pnpm", "start"]
