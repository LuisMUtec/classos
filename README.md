# edhack

Monorepo del proyecto: dashboard de inteligencia educativa con multi-agent pipelines (Mastra) y Next.js.

## Estructura

```
edhack/
├── packages/
│   ├── mastra/    # Servidor Mastra (agents + workflows) → http://localhost:4111
│   └── web/       # Next.js dashboard → http://localhost:3000
├── supabase/      # Migraciones + config Supabase (persistencia de runs)
└── archive/       # Versiones previas del código (referencia)
```

## Setup

```bash
cp .env.example .env                    # OPENROUTER_API_KEY (ya seteado si vienes del dashboard)
cp packages/web/.env.local.example packages/web/.env.local  # Supabase keys
pnpm install
pnpm dev
```

`pnpm dev` levanta ambos procesos en paralelo:

- **Mastra Studio + API** → http://localhost:4111
- **Dashboard UI** → http://localhost:3000

## Comandos

| Script | Qué hace |
|---|---|
| `pnpm dev` | Mastra + Next.js en paralelo |
| `pnpm dev:mastra` | Solo Mastra |
| `pnpm dev:web` | Solo Next.js |
| `pnpm build` | Build de ambos |
| `pnpm typecheck` | tsc --noEmit en ambos |
| `pnpm generate` | CLI: genera un ejercicio (`-- --topic recursion --duration 30`) |
| `pnpm demo:reject` | CLI: demo de rechazo en designer-solver loop |
| `pnpm test:sandbox` | Smoke test del sandbox de Python |

## Pestañas del dashboard

- **Overview** — stats + quick start
- **Chat** — chat con `assistant` agent vía AI SDK UI
- **Agents** — listado en vivo de agents/workflows desde Mastra
- **Pipelines** — runner de workflows multi-agent (exerciseGenerator, debuggingTutor)
- **Library** — runs persistidos en Supabase
- **Settings** — env, tema, providers

## Cómo agregar una pestaña

1. Crea `packages/web/app/(dashboard)/<feature>/page.tsx`
2. Añade la entrada en `packages/web/lib/nav.ts`
3. Si necesita IA: `useChat()` apuntando a `/api/chat`, o llama un workflow Mastra desde una API route

## Cómo agregar un agent o workflow

1. Crea `packages/mastra/src/mastra/agents/<id>.ts` (o `workflows/<id>.ts`)
2. Regístralo en `packages/mastra/src/mastra/index.ts`
3. Hot reload usualmente lo toma; si no, `pnpm dev:mastra` reinicia

## Stack

- **Next.js 16** + React 19 + TypeScript estricto
- **Tailwind v4** + shadcn/ui (radix-nova) + lucide-react
- **AI SDK v5** (`ai`, `@ai-sdk/react`) + `@openrouter/ai-sdk-provider`
- **Mastra** (`@mastra/core`, `@mastra/client-js`) con OpenRouter
- **Supabase** para persistencia de runs (opcional)
- **Streamdown** + **Shiki** para markdown/code streaming
