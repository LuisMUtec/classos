# dashboard

Baseline tipo dashboard (estilo Vercel / Supabase / Cognitia) con Next.js + AI SDK UI + Mastra como motor de agents/workflows.

## Estructura

```
dashboard/
  mastra/   # Servidor Mastra (mastra dev → :4111)
  web/      # Next.js app (next dev → :3000)
```

## Setup

```bash
cd dashboard
cp .env.example .env
# editar .env con tu OPENROUTER_API_KEY
pnpm install
pnpm dev
```

`pnpm dev` levanta ambos procesos en paralelo (Mastra en :4111, Next.js en :3000).

## Endpoints

- `http://localhost:3000` — Dashboard UI
- `http://localhost:4112` — Mastra Studio (testing UI + REST API). Cambia el puerto con `MASTRA_PORT=` o editando `mastra/src/mastra/index.ts`.

## Cómo agregar una pestaña

1. Crea `web/app/(dashboard)/<tu-feature>/page.tsx`.
2. Agrega la entrada al `NAV_ITEMS` en `web/lib/nav.ts`.
3. Si necesita AI: usa `useChat()` (apuntando a `/api/chat`) o crea una API route que llame a un agent/workflow Mastra vía `MastraClient`.

## Cómo agregar un agent/workflow Mastra

1. Crea `mastra/src/mastra/agents/<id>.ts` (o `workflows/<id>.ts`).
2. Regístralo en `mastra/src/mastra/index.ts`.
3. Reinicia `pnpm dev:mastra` (hot reload usualmente lo toma solo).

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind v4** + shadcn/ui (estilo `radix-nova`) + lucide-react
- **AI SDK v5** (`ai`, `@ai-sdk/react`) + `@openrouter/ai-sdk-provider`
- **Mastra** (`@mastra/core`, `@mastra/client-js`) con OpenRouter como provider de modelos
