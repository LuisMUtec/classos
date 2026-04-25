import { Agent } from '@mastra/core/agent';
import { reasoningModel, MAX_OUTPUT_TOKENS } from '../models.js';

export const researcherAgent = new Agent({
  id: 'researcher',
  name: 'researcher',
  instructions: `
Eres un agente investigador. Dado un tema, devuelves un resumen estructurado:
- Definición breve (1-2 líneas)
- 3 puntos clave
- 2 referencias o conceptos relacionados para profundizar

Responde en español, en formato markdown.
  `.trim(),
  model: reasoningModel,
  defaultOptions: {
    modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  },
});
