# Opción 1 — Tutor Socrático de Debugging (CS / Python)

> Reservada para eventual implementación post-edhack o como alternativa si Opción 2 se descarta.

## Contexto
- **Reto:** EdHack STEM — reto tech opcional multi-agente
- **Dominio:** Educación de Ciencia de la Computación
- **Lenguaje objetivo:** Python
- **Usuario:** Estudiante aprendiendo programación (intro / algoritmos básicos)

## Problema
El debugging es donde más se aprende en CS, pero también donde más se abandona:
- Google/ChatGPT da la respuesta directa → el alumno no aprende
- Profesores no escalan a soporte 1-a-1
- Los tutores online (Replit AI, Copilot) dan hints genéricos sin modelar el concepto detrás del bug

## Arquitectura multi-agente

```
Input: código Python buggy + (opcional) descripción de qué debería hacer

┌──────────────────────────────────────────────────────────────┐
│  Agent A — Analyzer                                          │
│  · Ejecuta código en sandbox Python                          │
│  · Clasifica: syntax / runtime / logic                       │
│  · Extrae traceback + diff contra expected output            │
│  · Output: BugReport { tipo, línea, evidencia_ejecución }    │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Agent B — Concept Mapper                                    │
│  · Identifica concepto CS detrás del bug                     │
│    (off-by-one, mutación compartida, scope, recursión...)    │
│  · Output: ConceptTag + referencia pedagógica                │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Agent C — Socratic Hinter                                   │
│  · Genera 3 niveles de pista progresiva:                     │
│    L1: pregunta general que lleva a pensar                   │
│    L2: apunta a la línea sospechosa                          │
│    L3: explica el concepto sin dar el fix                    │
│  · Output: ProgressiveHints                                  │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Agent D — Verifier  ★ EL DIFERENCIADOR ★                    │
│  · Aplica la pista L3 al código                              │
│  · Ejecuta el código corregido                               │
│  · Si NO lleva al fix → rechaza pista, re-invoca Hinter      │
│  · Output: VerifiedHints con proof-of-execution              │
└──────────────────────────────────────────────────────────────┘
```

## Por qué gana el reto tech

1. **Multi-agente real, no 4 prompts en cascada**
   - Loop de validación (D → C si rechaza)
   - Cada agente usa tools distintas (Analyzer y Verifier ejecutan código; los otros no)

2. **Verificación por ejecución, no LLM-on-LLM**
   - El "verificador" del ejemplo de nutrición es débil (LLM juzga LLM)
   - Aquí la validación es "¿corre y pasa tests?" — ground truth

3. **Valor pedagógico genuino**
   - No da la respuesta → aborda el miedo de los profes a ChatGPT
   - Método socrático tiene literatura como pedagogía efectiva

## Stack
- Mastra (workflows + agents + tools)
- OpenRouter + `google/gemini-2.5-flash`
- Sandbox Python: `subprocess` con timeout (MVP) / Docker (ideal)
- UI: Mastra dev playground para demo (muestra el trace multi-agente gratis)
- Zod schemas entre agentes

## Demo script (60 s)
1. Alumno pega código que debería sumar una lista pero da `IndexError`
2. UI muestra pipeline corriendo agente por agente
3. Analyzer → "IndexError línea 5"
4. Concept Mapper → "Off-by-one en loop"
5. Hinter → produce L1/L2/L3
6. Verifier → aplica L3, ejecuta, confirma que guía al fix
7. Usuario elige L1 → resuelve por su cuenta

## Tradeoff vs Opción 2
- **Gana:** sandbox de ejecución impresiona más técnicamente
- **Pierde:** artefacto final efímero (conversación) vs doc listo para clase
- **Riesgo:** sandbox seguro en 1 día obliga a cortar esquinas (confiar en que input no es malicioso)

## Issues abiertos
- [ ] Sandbox Python: subprocess + timeout vs Docker vs pyodide
- [ ] Cómo validar que la pista "guía al fix" sin resolver el problema por el alumno
- [ ] Código que depende de `input()` o librerías externas
- [ ] Visualización del trace multi-agente (Mastra playground o UI custom)
