import { Agent } from '@mastra/core/agent';
import { fastModel, MAX_OUTPUT_TOKENS } from '../models.js';

export const assistantAgent = new Agent({
  id: 'assistant',
  name: 'assistant',
  instructions: `
Eres un asistente general del dashboard. Responde de forma concisa y útil en español.
Si el usuario pide algo que requiere conocimiento de su data, dile claramente que aún
no tienes acceso a esa fuente y sugiere cómo conectarla.
  `.trim(),
  model: fastModel,
  defaultOptions: {
    modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  },
});
