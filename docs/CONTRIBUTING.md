# Cómo trabajamos

## División del trabajo

| Persona | Foco | Paquete principal | Owns |
|---|---|---|---|
| **luism** (lead MCP) | Server MCP core | `packages/mcp-server/` | Tool dispatcher, lifecycle, conexión con verifiers y DB |
| **Dev A** (platform) | Authoring + analytics | `packages/web/` | Dashboard del profe, dashboard live de alumnos, generación de tokens |
| **Dev B** (mcp-infra) | Conectividad | `packages/mcp-server/transports/` + `adapters/` | stdio, HTTP, OpenAI adapter, deploy |
| **Dev C** (use-cases) | Verificación + contenido | `packages/verifiers/` + seeds | Python tests, SymPy, redacción de ejercicios reales (mates + CS) |

## Camino crítico

`packages/contracts/` (schemas Zod compartidos) es el contrato entre todos.
**Hasta que esté mergeado, los demás están bloqueados.** Lo escribe luism primero (~30 min).

## Workflow git

- **Trunk-based**: `main` siempre verde. Push directo si typecheck pasa.
- **Sin PRs largos**: para hackathon, commits frecuentes y atómicos.
- **Cada dev en su carpeta**: conflictos sólo posibles en `contracts/`. Si vas a tocarlo, avisa en el chat antes.
- **Branch `demo` congelada 1h antes de presentar**: solo bug fixes ahí.

## Pre-commit checklist

```bash
pnpm typecheck   # rápido, evita romper a otros
```

## Qué NO hacer

- No tocar paquetes que no son tuyos sin avisar
- No reescribir `contracts/` sin coordinación
- No commitear `.env` (ya está en `.gitignore`)
- No usar `git push --force`

## Cómo arrancar (cualquier dev)

```bash
git clone https://github.com/LuisMUtec/classos
cd classos
cp .env.example .env       # pide la OPENROUTER_API_KEY a luism
pnpm install
pnpm dev
```
