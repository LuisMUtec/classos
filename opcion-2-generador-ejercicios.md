# Opción 2 — Generador de Ejercicios de CS Validados (Python)

> **Apuesta principal para EdHack STEM 2026-04-25.**

## Contexto
- **Reto:** EdHack STEM — reto tech opcional multi-agente
- **Dominio:** Educación de Ciencia de la Computación (universitario intro / CS101)
- **Lenguaje objetivo:** Python
- **Usuario:** Profe de CS que necesita generar ejercicios de calidad en minutos, no horas

## Análisis del jurado (por qué Opción 2)

| Juez | Sesgo | Qué pesará |
|---|---|---|
| Jorge Paredes (CTO Amelia / MásEducación) | Tech + producto edu | Arquitectura + sentido pedagógico |
| **Julio Yarasca (Docente CS UTEC)** | **Es el usuario target del demo** | Que esto le sirva mañana en clase |
| Jorge Fernández (Tech Leader Musa) | Puro técnico | Arquitectura + loops de validación |

**Lectura crítica:** 2.5/3 jueces son técnicos, pero Yarasca es literalmente el usuario del producto. Un juez que es el usuario es la jugada más fuerte posible — al ver el demo se imagina usándolo.

Mentores también sesgan pro-Opción-2:
- Omar Fernández Lanegra (AI/Backend McKinsey) → pedirá verificación rigurosa
- Geraldine García (MIT Aidea for Education) → pedirá valor pedagógico tangible

Opción 2 cubre ambos vectores.

## El dolor real
- Generar un buen ejercicio toma ~1 hora (enunciado + solución + tests + rúbrica + errores comunes)
- ChatGPT genera enunciados pero **no valida que sean solvables** ni que el enunciado no sea ambiguo
- Ningún profe confía en código generado por IA sin ejecutarlo él mismo
- **Tu sistema lo ejecuta por él** → esa es la tesis

## Arquitectura multi-agente

```
Input del profe:
  - tema (lista cerrada: loops, condicionales, funciones, recursión,
          listas, dicts, OOP básico)
  - nivel (intro universitario)
  - duración (ej. 45 min)
  - restricciones opcionales (sin librerías externas, etc.)

┌─────────────────────────────────────────────────────────────────┐
│ Agent A — Researcher / Contextualizer                           │
│ · Propone 3–5 contextos auténticos para el tema                 │
│   (recursión → árbol de carpetas, descomposición primos,        │
│    parsing de expresiones, torres de Hanoi)                     │
│ · Filtra los que encajan con nivel + duración                   │
│ · Output: ScenarioCandidates[]                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼ selecciona mejor candidato
┌─────────────────────────────────────────────────────────────────┐
│ Agent B — Problem Designer                                      │
│ · Redacta enunciado completo:                                   │
│     historia + input/output spec + 3 ejemplos + constraints     │
│ · Output: ProblemStatement                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Agent C — Solver-Validator  ★ EL DIFERENCIADOR ★                │
│ · Escribe solución Python                                       │
│ · Escribe test suite (happy + edge cases + edge-of-spec)        │
│ · EJECUTA en subprocess con timeout                             │
│ · Si tests pasan → emite SolutionPackage                        │
│ · Si falla o problema es ambiguo → REJECT → vuelve a B          │
│   con feedback concreto ("ejemplo 2 contradice spec")           │
│ · Max 2 retries, luego escala honestamente                      │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Agent D — Pedagogical Reviewer                                  │
│ · Genera rúbrica (criterios × niveles de logro)                 │
│ · Lista de errores comunes esperados (off-by-one, shared        │
│   mutable state, recursión sin caso base, etc.)                 │
│ · Pistas progresivas para el profe (cómo guiar sin spoilear)    │
│ · Extensiones (cómo subir dificultad en el momento)             │
│ · Output: TeacherPackage                                        │
└─────────────────────────────────────────────────────────────────┘

Salida final: documento Markdown con 2 secciones:
  [ALUMNO]  enunciado + ejemplos + constraints
  [PROFE]   solución + tests + rúbrica + errores comunes + extensiones
```

## Por qué este diseño gana el reto tech

1. **Multi-agente con LOOP de rechazo real (C → B)**
   No es pipeline lineal. C rechaza a B con feedback concreto. Ese loop es lo que diferencia "multi-agente" de "chain of prompts".

2. **Verificación por ejecución, no LLM-on-LLM**
   C corre `python solution.py` con tests. Ground truth. El ejemplo de nutrición del taller no puede hacer eso → tu demo se ve superior.

3. **Especialización clara (cada agente justifica existir)**
   - Researcher sabe del mundo real, no de código
   - Designer sabe pedagogía de enunciados, no valida solvencia
   - Solver sabe Python, no sabe redactar historias
   - Reviewer sabe evaluación, no programa

4. **Artefacto tangible para el usuario-juez**
   Yarasca termina la demo con un .md que podría llevarse a su clase del lunes. Ningún otro equipo va a tener eso.

## Stack
- **Mastra** — workflow con steps + 4 agents. El loop C→B se modela como branch/retry en workflow, no como conversación entre agentes
- **OpenRouter + `google/gemini-2.5-flash`**
- **Ejecución Python:** `subprocess.run` con `timeout=5s` + validación de imports sospechosos
- **UI:** Mastra dev playground (muestra el trace del workflow gratis) → si sobra tiempo, form + render Markdown
- **Schemas Zod** rigurosos entre agentes (vital para vender la arquitectura en slides)

## Decisiones de scope (defaults propuestos)

| Decisión | Default | Razón |
|---|---|---|
| Nivel educativo | Universitario intro puro | Yarasca está ahí; evita complejidad de currículos múltiples |
| Input del profe | Lista cerrada de temas | Garantiza calidad en demo; sin riesgo de "grafos avanzados" que exploten |
| Contextos | Storytelling | Datasets reales = stretch goal |
| Loop rechazo | Hard limit 2 retries | Honestidad > falsas garantías |
| Demo del loop | Forzar 1 rechazo intencional | Es el momento más impresionante de la demo |

## Demo script (60–90 s)
1. Yarasca-style profe pide *"ejercicio de recursión, intro universitario, 45 min"*
2. UI muestra Researcher proponiendo 3 contextos auténticos
3. Designer redacta el del **árbol de carpetas** con historia
4. **[Forzado]** Solver-Validator detecta ambigüedad en ejemplo 2 → rechaza → Designer refina
5. Solver-Validator pasa: muestra solución + suite de tests **corriendo en pantalla con output verde**
6. Reviewer arma rúbrica + errores comunes + extensiones
7. Profe ve el documento → "esto lo podría usar mañana en clase"

## Issues abiertos (a resolver durante build)
- [ ] Definir lista cerrada exacta de temas soportados (8–10 items)
- [ ] Catálogo de contextos auténticos por tema (semilla para Researcher)
- [ ] Schemas Zod: ScenarioCandidates, ProblemStatement, SolutionPackage, TeacherPackage
- [ ] Sandbox Python: subprocess + timeout + import allowlist
- [ ] Renderizado Markdown final (UI o solo file output)
- [ ] Cómo modelar el loop C→B en Mastra workflow (suspend/resume vs custom retry step)
