# @edhack/contracts

**El contrato compartido entre todos los paquetes.** Son los schemas Zod que define qué entiende el MCP server, qué guarda Supabase, qué espera el dashboard, y qué firmas tienen los verifiers.

> ⚠️ Si tocas algo aquí, **avisa en el chat antes de hacer push** — bloqueas a los demás.

## Qué hay aquí

| Archivo | Define | Quién lo consume |
|---|---|---|
| `subject.ts` | `Subject`, `Difficulty` enums | todos |
| `course.ts` | `Course`, `Lesson`, `Exercise` | platform (CRUD), MCP server (lectura) |
| `verification.ts` | `VerificationSpec`, `VerificationResult`, `Verifier` interface | verifiers, MCP server |
| `student.ts` | `Student`, `Progress` | todos |
| `events.ts` | `Interaction`, `InteractionType` | MCP server (write), platform (read) |
| `mcp-tools.ts` | input/output + descripciones de cada MCP tool | MCP server (registro), adapters (traducción) |

## Cómo usarlo

```ts
import { Course, VerificationSpec, McpTools } from '@edhack/contracts';

// Validar input
const course = Course.parse(rawInput);

// Acceder a una tool
const tool = McpTools.evaluate_answer;
console.log(tool.description);
const validated = tool.input.parse(args);
```

## Reglas de diseño

1. **Discriminated unions sobre `kind`** para cualquier polimorfismo (ver `VerificationSpec`).
2. **Cambios aditivos**: agregar un nuevo `VerificationKind` o `InteractionType` está bien; renombrar uno existente rompe DB y dashboard.
3. **Descripciones de tools son producto**, no docs. La IA cliente las lee para decidir qué tool llamar — editarlas con cuidado.
4. **Sin lógica**, solo schemas + tipos. La implementación va en otros paquetes.
