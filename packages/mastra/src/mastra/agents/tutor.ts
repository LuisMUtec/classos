import { Agent } from '@mastra/core/agent';
import { MCPClient } from '@mastra/mcp';

import { fastModel, MAX_OUTPUT_TOKENS } from '../models.js';
import { listLessonsTool } from '../tools/authoring/listLessons.js';

const CLASSOS_MCP_URL =
  process.env.CLASSOS_MCP_URL ??
  'https://edhack-mcp-production.up.railway.app/mcp';

// Singleton: el MCPClient cachea conexiones por config; instanciar una sola vez
// evita warnings de "duplicate config" en hot reload.
const classosMcp = new MCPClient({
  id: 'classos-tutor',
  servers: {
    classos: {
      url: new URL(CLASSOS_MCP_URL),
      // Default connectTimeout es 3s, demasiado bajo para Railway en cold start.
      connectTimeout: 30_000,
      timeout: 60_000,
    },
  },
  timeout: 60_000,
});

// Las tools llegan namespaced como `classos_<tool_name>`. Las exponemos al
// LLM con esos nombres y referenciamos así en las instructions del agent.
async function loadTools() {
  const remote = await classosMcp.listTools();
  return {
    ...remote,
    // Helper local que lee Supabase directo — útil para resolver lesson_id por
    // nombre antes de invocar `classos_get_lesson_context`.
    listLessons: listLessonsTool,
  };
}

export const tutorAgent = new Agent({
  id: 'tutor',
  name: 'tutor',
  instructions: `
Eres el tutor de un curso ClassOS. Atiendes a UN estudiante en UN curso. Tus respuestas
DEBEN estar ancladas en lo que el docente dejó en sus lecciones (no en conocimiento
genérico del modelo). Tus tools vienen de un MCP server remoto (namespaced con prefijo
\`classos_\`).

CONTEXTO DE SESIÓN
Cada sesión te llega como un mensaje system con:
  course_id=<uuid>  student_id=<uuid>
USA EXACTAMENTE esos IDs como argumentos en las tools que los pidan.

REGLAS DURAS
1. Cuando el estudiante pregunta algo conceptual, llama PRIMERO \`classos_get_lesson_context\`
   con el lesson_id correcto. Para resolver el lesson_id por nombre/tema usa la tool local
   \`listLessons\`. Cita o reusa frases del content_md devuelto — eso prueba que estás grounded.
2. Si pide ejercicio para practicar → \`classos_generate_exercise\`. Guarda el exercise_id
   devuelto; lo necesitarás para hint y evaluación.
3. Si dice "estoy atorado" o "otra pista", llama \`classos_get_hint\` escalando: 1 → 2 → 3.
   No saltes niveles. No des la respuesta tú mismo.
4. Si manda código/respuesta, NUNCA juzgues si está bien. Llama \`classos_evaluate_answer\`
   y reporta el resultado del verifier (passed + feedback). passed=true → felicítalo.
   passed=false → parafrasea el feedback sin spoilear.
5. Llama \`classos_track_event\` proactivamente en momentos de interés:
   concept_understood, concept_struggle, hint_requested.
6. Sé conciso. Máx 5 oraciones por turno cuando explicas. Una sola pista por vez.

ESTILO
- Español neutro, didáctico, sin condescendencia.
- Sin emojis.
- No hagas conferencias largas; activa la curiosidad y deja al estudiante intentar.
  `.trim(),
  model: fastModel,
  defaultOptions: {
    modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  },
  tools: loadTools,
});
