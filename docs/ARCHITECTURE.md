# Arquitectura — ClassOS

## Idea en una frase

Un servidor MCP que convierte cualquier curso en un entorno consumible por cualquier LLM.
El profesor define lecciones y ejercicios una vez; el sistema expone resources (contexto)
y tools (acciones verificables — incluyendo ejecución de código en sandbox) que cualquier
IA cliente puede invocar. Cada interacción queda trackeada para analytics del docente.

## Diagrama

```
┌─────────────────────────────────────────────────────────────┐
│  Authoring (packages/web)              ← Dev A              │
│  Profe → crea Course → Lesson → Exercise → seeds Supabase   │
│  (reusa /pipelines: exerciseGenerator pre-genera)           │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  MCP Server (packages/mcp-server)      ← luism + Dev B      │
│                                                             │
│  Resources (read-only):                                     │
│    class://{course}/syllabus                                │
│    class://{course}/lesson/{id}                             │
│                                                             │
│  Tools (acciones):                                          │
│    get_lesson_context(lesson_id)                            │
│    generate_exercise(topic, difficulty)  → workflow Mastra  │
│    evaluate_answer(exercise_id, answer)  → verifier ★       │
│    get_hint(exercise_id, level)          → agent Hinter     │
│    track_event(student_id, type, payload)                   │
│                                                             │
│  Transports (Dev B):                                        │
│    - stdio (Claude Desktop, Cursor)                         │
│    - HTTP/SSE (web hosted)                                  │
│    - OpenAI tools adapter (compat con cualquier LLM)        │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Verifiers (packages/verifiers)        ← Dev C              │
│    python_tests        → executePython sandbox              │
│    sympy_equivalence   → SymPy en sandbox                   │
│    sympy_numeric       → SymPy con tolerancia               │
│    exact_match         → comparación normalizada            │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Cliente: cualquier LLM con MCP o tool-calling              │
│  Estudiante hace preguntas → IA llama tools → respuestas    │
│  alineadas al curso del profe.                              │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Analytics (packages/web)              ← Dev A              │
│  Profe ve interacciones en vivo, errores comunes, progreso  │
└─────────────────────────────────────────────────────────────┘
```

## Modelo de datos (Supabase)

```sql
courses        (id, teacher_id, name, subject, mcp_token)
lessons        (id, course_id, order, title, content_md, objectives jsonb)
exercises      (id, lesson_id, statement_md,
                verification_kind text,        -- discriminador
                verification_spec jsonb)       -- shape varía por kind
students       (id, course_id, display_name, anon_token)
interactions   (id, student_id, lesson_id, tool_called, payload jsonb, created_at)
progress       (student_id, lesson_id, mastery_score, last_activity)
```

## El contrato más importante: `verification_kind`

Una sola tool `evaluate_answer` despacha por `verification_kind`:

| kind | Caso | Ejecución |
|---|---|---|
| `python_tests` | CS — alumno entrega código | `pytest` sobre solución del alumno |
| `sympy_equivalence` | Mates — algebra/simplificación | `simplify(student - expected) == 0` |
| `sympy_numeric` | Mates — eval con tolerancia | Plug values, compara |
| `exact_match` | Respuestas cerradas | Comparación normalizada |

Mismo sandbox Python, dispatcher distinto. Sin acoplamiento entre dominios.

## Por qué gana el reto técnico

1. **Verificación por ejecución, no LLM-on-LLM** — `evaluate_answer` corre el sandbox; ground truth real.
2. **Multi-dominio sobre la misma capa** — CS y mates con la misma API; prueba que es infraestructura, no toy.
3. **LLM-agnóstico** — MCP nativo + adapter OpenAI = funciona con cualquier IA con tool calling.
4. **Loop docente↔alumno cerrado** — cada interacción tracked → analytics en vivo para el profe.
